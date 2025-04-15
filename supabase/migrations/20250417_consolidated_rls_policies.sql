
-- Drop existing RLS policies to avoid duplication
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Loop through all policies for our tables and drop them
    FOR policy_record IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('admins', 'lesson_ratings', 'lessons', 'pages', 'sections', 'user_progress', 'admin_audit_log', 'user_profiles')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 
                      policy_record.policyname, 
                      policy_record.tablename);
    END LOOP;
END
$$;

-- Enable RLS on all tables
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Add security timeout to all secure functions
ALTER FUNCTION admin_reset_user_password(UUID, TEXT) SET statement_timeout = '3s';
ALTER FUNCTION grant_admin_privileges(UUID) SET statement_timeout = '3s';
ALTER FUNCTION revoke_admin_privileges(UUID) SET statement_timeout = '3s';

-- ADMIN AUDIT LOG POLICIES
-- Only admins can view the audit log
CREATE POLICY "Admins can view audit logs"
  ON admin_audit_log
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admins WHERE user_id = auth.uid()
  ));

-- Only admins can insert into audit log
CREATE POLICY "Only admins can insert audit logs"
  ON admin_audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM admins WHERE user_id = auth.uid()
  ));

-- ADMINS TABLE POLICIES
-- Only allow authenticated users to SELECT from admins (for admin checks)
CREATE POLICY "Users can check admin status"
ON public.admins
FOR SELECT
TO authenticated
USING (true);

-- Block direct access to admin tables - must use secure functions
CREATE POLICY "Only system can modify admin table"
ON public.admins
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

-- USER PROFILES POLICIES
-- Users can view their own profiles
CREATE POLICY "Users can view their own profile"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM admins WHERE user_id = auth.uid()
));

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM admins WHERE user_id = auth.uid()
));

-- LESSON RATINGS POLICIES
-- Users can only see their own ratings
CREATE POLICY "Users can view their own ratings"
ON public.lesson_ratings
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can only add their own ratings
CREATE POLICY "Users can add their own ratings"
ON public.lesson_ratings
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can only update their own ratings
CREATE POLICY "Users can update their own ratings"
ON public.lesson_ratings
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can only delete their own ratings
CREATE POLICY "Users can delete their own ratings"
ON public.lesson_ratings
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- LESSONS POLICIES
-- All authenticated users can view lessons
CREATE POLICY "Authenticated users can view lessons"
ON public.lessons
FOR SELECT
TO authenticated
USING (true);

-- Only admins can modify lessons
CREATE POLICY "Only admins can insert lessons"
ON public.lessons
FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));

CREATE POLICY "Only admins can update lessons"
ON public.lessons
FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));

CREATE POLICY "Only admins can delete lessons"
ON public.lessons
FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));

-- SECTIONS POLICIES
-- All authenticated users can view sections
CREATE POLICY "Authenticated users can view sections"
ON public.sections
FOR SELECT
TO authenticated
USING (true);

-- Only admins can modify sections
CREATE POLICY "Only admins can insert sections"
ON public.sections
FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));

CREATE POLICY "Only admins can update sections"
ON public.sections
FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));

CREATE POLICY "Only admins can delete sections"
ON public.sections
FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));

-- PAGES POLICIES
-- All authenticated users can view pages
CREATE POLICY "Authenticated users can view pages"
ON public.pages
FOR SELECT
TO authenticated
USING (true);

-- Only admins can modify pages
CREATE POLICY "Only admins can insert pages"
ON public.pages
FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));

CREATE POLICY "Only admins can update pages"
ON public.pages
FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));

CREATE POLICY "Only admins can delete pages"
ON public.pages
FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));

-- USER_PROGRESS POLICIES
-- Users can view only their own progress
CREATE POLICY "Users can view their own progress"
ON public.user_progress
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can only insert their own progress
CREATE POLICY "Users can insert their own progress"
ON public.user_progress
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can only update their own progress
CREATE POLICY "Users can update their own progress"
ON public.user_progress
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can only delete their own progress
CREATE POLICY "Users can delete their own progress"
ON public.user_progress
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Create improved rate limiting function
CREATE OR REPLACE FUNCTION check_rate_limit(
  action_type TEXT,
  max_attempts INTEGER DEFAULT 10,
  window_period INTERVAL DEFAULT '15 minutes'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  recent_attempts INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO recent_attempts
  FROM admin_audit_log
  WHERE 
    admin_id = auth.uid() AND
    action_type = check_rate_limit.action_type AND
    created_at > NOW() - window_period;
    
  -- Return true if within limit, false if exceeded
  RETURN recent_attempts < max_attempts;
END;
$$;

-- Update the admin privileges functions to include rate limiting
CREATE OR REPLACE FUNCTION grant_admin_privileges(
  target_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  caller_is_admin BOOLEAN;
  user_already_admin BOOLEAN;
BEGIN
  -- Check rate limiting first
  IF NOT check_rate_limit('grant_admin', 5, interval '30 minutes') THEN
    -- Log rate limit exceeded
    INSERT INTO admin_audit_log (admin_id, action_type, target_user_id, details)
    VALUES (auth.uid(), 'grant_admin_rate_limited', target_user_id, 
            jsonb_build_object('reason', 'rate_limit_exceeded', 'timestamp', now()));
            
    RETURN jsonb_build_object('success', false, 'error', 'Rate limit exceeded for admin operations');
  END IF;

  -- Check if the calling user is an admin
  SELECT EXISTS (
    SELECT 1 FROM admins 
    WHERE user_id = auth.uid()
  ) INTO caller_is_admin;
  
  IF NOT caller_is_admin THEN
    -- Log failed attempt
    INSERT INTO admin_audit_log (admin_id, action_type, target_user_id, details)
    VALUES (auth.uid(), 'grant_admin_failed', target_user_id, 
            jsonb_build_object('reason', 'not_admin', 'timestamp', now()));
            
    RETURN jsonb_build_object('success', false, 'error', 'Only admins can grant admin privileges');
  END IF;
  
  -- Check if user is already an admin
  SELECT EXISTS (
    SELECT 1 FROM admins 
    WHERE user_id = target_user_id
  ) INTO user_already_admin;
  
  IF user_already_admin THEN
    RETURN jsonb_build_object('success', false, 'error', 'User already has admin privileges');
  END IF;
  
  -- Grant admin privileges
  INSERT INTO admins (user_id)
  VALUES (target_user_id);
  
  -- Log successful grant
  INSERT INTO admin_audit_log (admin_id, action_type, target_user_id, details)
  VALUES (auth.uid(), 'grant_admin_success', target_user_id, 
          jsonb_build_object('timestamp', now()));
  
  RETURN jsonb_build_object('success', true);
END;
$$;

-- Update revoke admin privileges function to include rate limiting
CREATE OR REPLACE FUNCTION revoke_admin_privileges(
  target_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  caller_is_admin BOOLEAN;
  user_is_admin BOOLEAN;
BEGIN
  -- Check rate limiting first
  IF NOT check_rate_limit('revoke_admin', 5, interval '30 minutes') THEN
    -- Log rate limit exceeded
    INSERT INTO admin_audit_log (admin_id, action_type, target_user_id, details)
    VALUES (auth.uid(), 'revoke_admin_rate_limited', target_user_id, 
            jsonb_build_object('reason', 'rate_limit_exceeded', 'timestamp', now()));
            
    RETURN jsonb_build_object('success', false, 'error', 'Rate limit exceeded for admin operations');
  END IF;

  -- Check if the calling user is an admin
  SELECT EXISTS (
    SELECT 1 FROM admins 
    WHERE user_id = auth.uid()
  ) INTO caller_is_admin;
  
  IF NOT caller_is_admin THEN
    -- Log failed attempt
    INSERT INTO admin_audit_log (admin_id, action_type, target_user_id, details)
    VALUES (auth.uid(), 'revoke_admin_failed', target_user_id, 
            jsonb_build_object('reason', 'not_admin', 'timestamp', now()));
            
    RETURN jsonb_build_object('success', false, 'error', 'Only admins can revoke admin privileges');
  END IF;
  
  -- Prevent self-revocation
  IF target_user_id = auth.uid() THEN
    -- Log failed attempt
    INSERT INTO admin_audit_log (admin_id, action_type, target_user_id, details)
    VALUES (auth.uid(), 'revoke_admin_failed', target_user_id, 
            jsonb_build_object('reason', 'self_revocation', 'timestamp', now()));
            
    RETURN jsonb_build_object('success', false, 'error', 'Cannot revoke your own admin privileges');
  END IF;
  
  -- Check if target user is an admin
  SELECT EXISTS (
    SELECT 1 FROM admins 
    WHERE user_id = target_user_id
  ) INTO user_is_admin;
  
  IF NOT user_is_admin THEN
    RETURN jsonb_build_object('success', false, 'error', 'User does not have admin privileges');
  END IF;
  
  -- Revoke admin privileges
  DELETE FROM admins
  WHERE user_id = target_user_id;
  
  -- Log successful revocation
  INSERT INTO admin_audit_log (admin_id, action_type, target_user_id, details)
  VALUES (auth.uid(), 'revoke_admin_success', target_user_id, 
          jsonb_build_object('timestamp', now()));
  
  RETURN jsonb_build_object('success', true);
END;
$$;
