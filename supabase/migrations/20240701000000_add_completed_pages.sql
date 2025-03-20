-- Add completed_pages column to user_progress table
ALTER TABLE public.user_progress 
ADD COLUMN IF NOT EXISTS completed_pages TEXT[] DEFAULT '{}';

-- Add index for efficient queries by completed_pages
CREATE INDEX IF NOT EXISTS user_progress_completed_pages_idx ON public.user_progress USING gin(completed_pages);

-- Comment on column
COMMENT ON COLUMN public.user_progress.completed_pages IS 'Array of page IDs that the user has completed';

-- Function to check if a page is completed
CREATE OR REPLACE FUNCTION public.is_page_completed(
  p_user_id UUID,
  p_lesson_id UUID,
  p_page_id TEXT
) 
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _is_completed BOOLEAN;
BEGIN
  SELECT 
    p_page_id = ANY(completed_pages)
  INTO _is_completed
  FROM public.user_progress
  WHERE user_id = p_user_id
    AND lesson_id = p_lesson_id
  LIMIT 1;
  
  RETURN COALESCE(_is_completed, FALSE);
END;
$$; 