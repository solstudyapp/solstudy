-- Create user_progress table
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  current_section_id TEXT NOT NULL,
  current_page_id TEXT NOT NULL,
  completed_sections TEXT[] DEFAULT '{}',
  completed_quizzes TEXT[] DEFAULT '{}',
  is_completed BOOLEAN DEFAULT FALSE,
  points_earned INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint to ensure one progress record per user per lesson
  UNIQUE(user_id, lesson_id)
);

-- Add RLS policies
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own progress
CREATE POLICY "Users can view their own progress"
  ON public.user_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to insert their own progress
CREATE POLICY "Users can insert their own progress"
  ON public.user_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own progress
CREATE POLICY "Users can update their own progress"
  ON public.user_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow service role to manage all progress
CREATE POLICY "Service role can manage all progress"
  ON public.user_progress
  USING (auth.role() = 'service_role');

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS user_progress_user_id_idx ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS user_progress_lesson_id_idx ON public.user_progress(lesson_id);

-- Add function to update user's total points
CREATE OR REPLACE FUNCTION public.update_user_total_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the user's total points in the profiles table
  UPDATE public.profiles
  SET total_points = (
    SELECT COALESCE(SUM(points_earned), 0)
    FROM public.user_progress
    WHERE user_id = NEW.user_id
  )
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to update total points when progress changes
DROP TRIGGER IF EXISTS update_total_points_trigger ON public.user_progress;
CREATE TRIGGER update_total_points_trigger
AFTER INSERT OR UPDATE OF points_earned
ON public.user_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_user_total_points(); 