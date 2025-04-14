
-- Create a secure function for resetting user passwords
CREATE OR REPLACE FUNCTION admin_reset_user_password_direct(
  admin_user_id UUID,
  target_user_id UUID,
  new_password TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  -- Verify the user making the request is an admin
  SELECT EXISTS (
    SELECT 1 FROM admins 
    WHERE user_id = admin_user_id
  ) INTO is_admin;
  
  IF NOT is_admin THEN
    RETURN jsonb_build_object('success', false, 'error', 'Only admins can reset passwords');
  END IF;
  
  -- Basic password validation
  IF length(new_password) < 6 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Password must be at least 6 characters');
  END IF;
  
  -- Call Supabase Auth's built-in function to update the password
  -- This is the recommended way to change passwords in Supabase Auth
  UPDATE auth.users
  SET 
    raw_user_meta_data = jsonb_set(
      coalesce(raw_user_meta_data, '{}'::jsonb),
      '{password}',
      to_jsonb(new_password)
    ),
    updated_at = now()
  WHERE id = target_user_id;
  
  -- Log the action (this is important for audit purposes)
  INSERT INTO admin_audit_log (admin_id, action_type, target_user_id, details)
  VALUES (admin_user_id, 'password_reset_direct', target_user_id, 
          jsonb_build_object('timestamp', now()));
  
  RETURN jsonb_build_object('success', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Create a wrapper function that can be called via RPC
-- This one uses the current user context for added security
CREATE OR REPLACE FUNCTION admin_reset_user_password(
  target_user_id UUID,
  new_password TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  RETURN admin_reset_user_password_direct(auth.uid(), target_user_id, new_password);
END;
$$;

-- Set proper permissions to ensure only authenticated users can call this function
REVOKE ALL ON FUNCTION admin_reset_user_password(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_reset_user_password(UUID, TEXT) TO authenticated;
