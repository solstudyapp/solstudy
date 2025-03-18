-- Create user_quizzes table to track quiz completions and points
CREATE TABLE IF NOT EXISTS user_quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  score FLOAT NOT NULL,  -- Store as percentage (0-100)
  points_earned INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure each user can only complete a quiz once
  CONSTRAINT user_quiz_unique UNIQUE (user_id, quiz_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS user_quizzes_user_id_idx ON user_quizzes(user_id);
CREATE INDEX IF NOT EXISTS user_quizzes_quiz_id_idx ON user_quizzes(quiz_id);
CREATE INDEX IF NOT EXISTS user_quizzes_lesson_id_idx ON user_quizzes(lesson_id);

-- Set up RLS (Row Level Security)
ALTER TABLE user_quizzes ENABLE ROW LEVEL SECURITY;

-- Policies for user_quizzes table
-- Users can see their own quiz completions
CREATE POLICY user_quizzes_select_policy ON user_quizzes 
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own quiz completions but not modify existing ones
CREATE POLICY user_quizzes_insert_policy ON user_quizzes 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Only service role or admin can update or delete
CREATE POLICY user_quizzes_update_policy ON user_quizzes 
  FOR UPDATE USING (auth.uid() = user_id);

-- Add function to update user's total points
CREATE OR REPLACE FUNCTION update_user_total_points(user_uuid UUID)
RETURNS void AS $$
DECLARE
  course_points INTEGER;
  referral_points INTEGER;
  total_points INTEGER;
BEGIN
  -- Get sum of points from user_quizzes
  SELECT COALESCE(SUM(points_earned), 0) INTO course_points 
  FROM user_quizzes 
  WHERE user_id = user_uuid;
  
  -- Add any points from completed lessons in user_progress
  SELECT course_points + COALESCE(SUM(points_earned), 0) INTO course_points
  FROM user_progress
  WHERE user_id = user_uuid 
    AND is_completed = true;
  
  -- Get referral points
  SELECT COALESCE(SUM(r.points_earned), 0) INTO referral_points
  FROM referrals r
  JOIN referral_codes rc ON r.referral_code_id = rc.id
  WHERE rc.referrer_id = user_uuid 
    AND r.status = 'completed';
  
  -- Calculate total points
  total_points := course_points + referral_points;
  
  -- Update user_profiles
  UPDATE user_profiles
  SET points = total_points
  WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to update user points whenever a quiz is completed
CREATE OR REPLACE FUNCTION user_quiz_points_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the user's total points
  PERFORM update_user_total_points(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_points_after_quiz_completion
AFTER INSERT OR UPDATE ON user_quizzes
FOR EACH ROW
EXECUTE FUNCTION user_quiz_points_trigger(); 