-- Check if the user_progress table exists
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  section_id TEXT REFERENCES sections(id) ON DELETE CASCADE,
  page_id TEXT REFERENCES pages(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id, section_id, page_id)
);

-- Add section_id and page_id columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_progress' AND column_name = 'section_id') THEN
    ALTER TABLE user_progress ADD COLUMN section_id TEXT REFERENCES sections(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_progress' AND column_name = 'page_id') THEN
    ALTER TABLE user_progress ADD COLUMN page_id TEXT REFERENCES pages(id) ON DELETE CASCADE;
  END IF;
END
$$;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_section_id ON user_progress(section_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_page_id ON user_progress(page_id);

-- Create RLS policies
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Policy for users to see only their own progress
DROP POLICY IF EXISTS user_progress_select_policy ON user_progress;
CREATE POLICY user_progress_select_policy ON user_progress 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy for users to insert their own progress
DROP POLICY IF EXISTS user_progress_insert_policy ON user_progress;
CREATE POLICY user_progress_insert_policy ON user_progress 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own progress
DROP POLICY IF EXISTS user_progress_update_policy ON user_progress;
CREATE POLICY user_progress_update_policy ON user_progress 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy for users to delete their own progress
DROP POLICY IF EXISTS user_progress_delete_policy ON user_progress;
CREATE POLICY user_progress_delete_policy ON user_progress 
  FOR DELETE 
  USING (auth.uid() = user_id); 