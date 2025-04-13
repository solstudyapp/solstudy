
-- First, let's get all existing policies for our tables
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Loop through all policies for our tables and drop them
    FOR policy_record IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('admins', 'lesson_ratings', 'lessons', 'pages', 'sections', 'user_progress')
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

-- Only admins can insert into admins table
CREATE POLICY "Only admins can add new admins"
ON public.admins
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admins 
    WHERE user_id = auth.uid()
  )
);

-- Only admins can delete from admins table, but not themselves
CREATE POLICY "Only admins can remove admin privileges"
ON public.admins
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admins 
    WHERE user_id = auth.uid()
  ) 
  AND user_id != auth.uid()
);

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

-- SECTIONS POLICIES - Similar to lessons
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

-- PAGES POLICIES - Similar to sections
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
