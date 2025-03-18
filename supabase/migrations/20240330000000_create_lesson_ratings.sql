-- Create lesson_ratings table
CREATE TABLE IF NOT EXISTS lesson_ratings (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_lesson_rating UNIQUE (user_id, lesson_id)
);

-- Create indexes
CREATE INDEX lesson_ratings_lesson_id_idx ON lesson_ratings(lesson_id);
CREATE INDEX lesson_ratings_user_id_idx ON lesson_ratings(user_id);

-- Enable Row Level Security
ALTER TABLE lesson_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all ratings"
  ON lesson_ratings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own ratings"
  ON lesson_ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"
  ON lesson_ratings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Ensure lessons table has rating and review_count columns
ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0; 