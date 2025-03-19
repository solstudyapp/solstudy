CREATE OR REPLACE FUNCTION update_total_points(user_uuid UUID)
RETURNS void AS $$
DECLARE
  course_points INTEGER;
  referral_points INTEGER;
  referral_bonus INTEGER := 0;
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
  
  -- Get referral points (from being a referrer)
  SELECT COALESCE(SUM(r.points_earned), 0) INTO referral_points
  FROM referrals r
  JOIN referral_codes rc ON r.referral_code_id = rc.id
  WHERE rc.referrer_id = user_uuid 
    AND r.status = 'completed';
  
  -- Check if user was referred by someone else (being a referee)
  SELECT 
    CASE 
      WHEN EXISTS (
        SELECT 1 FROM referrals 
        WHERE referred_user_id = user_uuid 
        AND status = 'completed'
      ) 
      THEN 100 
      ELSE 0 
    END INTO referral_bonus;
  
  -- Calculate total points
  total_points := course_points + referral_points + referral_bonus;
  
  -- Update user_profiles
  UPDATE user_profiles
  SET points = total_points
  WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql; 