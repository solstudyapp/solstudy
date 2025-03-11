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

-- Create ALL policies for authenticated users
CREATE POLICY "Authenticated users can do everything with admins"
ON public.admins
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can do everything with lesson_ratings"
ON public.lesson_ratings
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can do everything with lessons"
ON public.lessons
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can do everything with pages"
ON public.pages
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can do everything with sections"
ON public.sections
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can do everything with user_progress"
ON public.user_progress
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true); 