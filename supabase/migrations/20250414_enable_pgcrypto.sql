
-- Enable pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- Also create it in the auth schema for better compatibility
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
    CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA auth;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not create pgcrypto in auth schema, continuing...';
END
$$;
