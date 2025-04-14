
-- Drop the functions we're no longer using since we're using the Supabase Admin API directly
DROP FUNCTION IF EXISTS admin_reset_user_password_direct(UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS admin_reset_user_password(UUID, TEXT);

-- Add a comment to explain what we're doing
COMMENT ON SCHEMA public IS 'Removed password reset functions as they are replaced by Supabase Admin API';

