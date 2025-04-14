
-- Create admin audit log table
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  target_user_id UUID REFERENCES auth.users(id),
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add RLS to admin_audit_log
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view the audit log
CREATE POLICY "Admins can view audit logs"
  ON admin_audit_log
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admins WHERE user_id = auth.uid()
  ));

-- Only the system can insert into audit log
CREATE POLICY "System can insert audit logs"
  ON admin_audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM admins WHERE user_id = auth.uid()
  ));

-- Create secure password reset function
CREATE OR REPLACE FUNCTION admin_reset_user_password(
  target_user_id UUID,
  new_password TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  caller_is_admin BOOLEAN;
  result JSONB;
  hashed_password TEXT;
BEGIN
  -- Check if the calling user is an admin
  SELECT EXISTS (
    SELECT 1 FROM admins 
    WHERE user_id = auth.uid()
  ) INTO caller_is_admin;
  
  IF NOT caller_is_admin THEN
    -- Log failed attempt
    INSERT INTO admin_audit_log (admin_id, action_type, target_user_id, details)
    VALUES (auth.uid(), 'password_reset_failed', target_user_id, 
            jsonb_build_object('reason', 'not_admin', 'timestamp', now()));
    
    RETURN jsonb_build_object('success', false, 'error', 'Only admins can reset passwords');
  END IF;
  
  -- Validate password
  IF length(new_password) < 6 THEN
    -- Log validation failure
    INSERT INTO admin_audit_log (admin_id, action_type, target_user_id, details)
    VALUES (auth.uid(), 'password_reset_failed', target_user_id, 
            jsonb_build_object('reason', 'invalid_password', 'timestamp', now()));
            
    RETURN jsonb_build_object('success', false, 'error', 'Password must be at least 6 characters');
  END IF;
  
  -- Hash the password using pgcrypto (make sure pgcrypto extension is enabled)
  hashed_password := crypt(new_password, gen_salt('bf'));
  
  -- Update the password directly in the auth.users table
  UPDATE auth.users
  SET encrypted_password = hashed_password
  WHERE id = target_user_id;
  
  -- Check if update was successful
  IF FOUND THEN
    -- Log successful password reset
    INSERT INTO admin_audit_log (admin_id, action_type, target_user_id, details)
    VALUES (auth.uid(), 'password_reset_success', target_user_id, 
            jsonb_build_object('timestamp', now()));
    
    RETURN jsonb_build_object('success', true);
  ELSE
    -- Log failed update
    INSERT INTO admin_audit_log (admin_id, action_type, target_user_id, details)
    VALUES (auth.uid(), 'password_reset_failed', target_user_id, 
            jsonb_build_object('reason', 'user_not_found', 'timestamp', now()));
            
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;
END;
$$;

-- Function to grant admin privileges securely
CREATE OR REPLACE FUNCTION grant_admin_privileges(
  target_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  caller_is_admin BOOLEAN;
  user_already_admin BOOLEAN;
BEGIN
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

-- Function to revoke admin privileges securely
CREATE OR REPLACE FUNCTION revoke_admin_privileges(
  target_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  caller_is_admin BOOLEAN;
  user_is_admin BOOLEAN;
BEGIN
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

-- Reset all RLS policies for better security
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Loop through all policies for our tables and drop them
    FOR policy_record IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('admins', 'lesson_ratings', 'lessons', 'pages', 'sections', 'user_progress', 'admin_audit_log')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 
                      policy_record.policyname, 
                      policy_record.tablename);
    END LOOP;
END
$$;

-- Enable RLS on all tables (in case it's not already enabled)
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- ADMINS TABLE POLICIES:
-- Only allow authenticated users to SELECT from admins (for admin checks)
CREATE POLICY "Users can check admin status"
ON public.admins
FOR SELECT
TO authenticated
USING (true);

-- Only admins can insert into admins table using the secure function
CREATE POLICY "Only admins can add new admins"
ON public.admins
FOR INSERT
TO authenticated
WITH CHECK (false); -- Block direct inserts, use the function instead

-- Only admins can delete from admins table, but not themselves, using the secure function
CREATE POLICY "Only admins can remove admin privileges"
ON public.admins
FOR DELETE
TO authenticated
USING (false); -- Block direct deletes, use the function instead

-- LESSON RATINGS POLICIES:
-- Users can only see their own ratings and general rating statistics
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

-- LESSONS POLICIES:
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
