
-- This migration is now repurposed to ensure pgcrypto is enabled
-- since we need it for password hashing in the admin_reset_user_password function

-- Check if pgcrypto extension is already enabled, if not enable it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto'
  ) THEN
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    RAISE NOTICE 'pgcrypto extension enabled';
  ELSE
    RAISE NOTICE 'pgcrypto extension already enabled';
  END IF;
END
$$;

-- Ensure our function exists with proper implementation
-- The implementation is in the 20250413_admin_security_upgrade.sql file
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'admin_reset_user_password'
  ) THEN
    RAISE NOTICE 'admin_reset_user_password function not found, it should be created in another migration';
  ELSE
    RAISE NOTICE 'admin_reset_user_password function exists';
  END IF;
END
$$;
