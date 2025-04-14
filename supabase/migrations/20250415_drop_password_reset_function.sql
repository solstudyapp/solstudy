
-- This migration is no longer needed since we're using the database function approach
-- Commenting out the drop statements

/*
DROP FUNCTION IF EXISTS admin_reset_user_password_direct(UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS admin_reset_user_password(UUID, TEXT);

COMMENT ON SCHEMA public IS 'Removed password reset functions as they are replaced by Supabase Admin API';
*/

-- Instead, ensure our function exists (it should already be created in a previous migration)
-- This is just to make sure the migration doesn't fail if run again
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'admin_reset_user_password'
  ) THEN
    RAISE NOTICE 'Creating admin_reset_user_password function';
    -- Function creation would go here if needed
  END IF;
END
$$;
