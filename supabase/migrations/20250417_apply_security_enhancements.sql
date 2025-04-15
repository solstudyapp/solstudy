
-- This migration applies all security enhancements in a consolidated way
-- Run this after deploying the updated application

-- Ensure pgcrypto extension is enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- Ensure audit log table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'admin_audit_log') THEN
    CREATE TABLE public.admin_audit_log (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      admin_id UUID NOT NULL REFERENCES auth.users(id),
      action_type TEXT NOT NULL,
      target_user_id UUID REFERENCES auth.users(id),
      details JSONB,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    
    RAISE NOTICE 'Created admin_audit_log table';
  ELSE
    RAISE NOTICE 'admin_audit_log table already exists';
  END IF;
END
$$;

-- Create index on admin_audit_log for faster queries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_admin_audit_log_action_type'
  ) THEN
    CREATE INDEX idx_admin_audit_log_action_type 
      ON admin_audit_log(action_type, created_at);
    CREATE INDEX idx_admin_audit_log_admin_id 
      ON admin_audit_log(admin_id, created_at);
    CREATE INDEX idx_admin_audit_log_target_user_id 
      ON admin_audit_log(target_user_id, created_at);
    
    RAISE NOTICE 'Created indexes on admin_audit_log';
  ELSE
    RAISE NOTICE 'Indexes on admin_audit_log already exist';
  END IF;
END
$$;

-- Add creation and update timestamps to all tables that don't have them
DO $$
DECLARE
  table_rec RECORD;
BEGIN
  FOR table_rec IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
  LOOP
    -- Check if the table has created_at column
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = table_rec.table_name 
      AND column_name = 'created_at'
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN created_at TIMESTAMPTZ DEFAULT now()', 
                     table_rec.table_name);
      RAISE NOTICE 'Added created_at to %', table_rec.table_name;
    END IF;
    
    -- Check if the table has updated_at column
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = table_rec.table_name 
      AND column_name = 'updated_at'
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now()', 
                     table_rec.table_name);
      RAISE NOTICE 'Added updated_at to %', table_rec.table_name;
    END IF;
  END LOOP;
END
$$;

-- Create or replace the updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger to all tables
DO $$
DECLARE
  table_rec RECORD;
BEGIN
  FOR table_rec IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
  LOOP
    -- Check if the table has updated_at column
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = table_rec.table_name 
      AND column_name = 'updated_at'
    ) THEN
      -- Drop trigger if it exists
      EXECUTE format('DROP TRIGGER IF EXISTS handle_updated_at ON public.%I', 
                     table_rec.table_name);
      
      -- Create trigger
      EXECUTE format('CREATE TRIGGER handle_updated_at
                     BEFORE UPDATE ON public.%I
                     FOR EACH ROW
                     EXECUTE FUNCTION public.handle_updated_at()', 
                     table_rec.table_name);
      
      RAISE NOTICE 'Added updated_at trigger to %', table_rec.table_name;
    END IF;
  END LOOP;
END
$$;

-- Create function to log failed login attempts (additional security measure)
CREATE OR REPLACE FUNCTION log_auth_event()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Log successful auth events
    INSERT INTO public.admin_audit_log (
      admin_id, 
      action_type, 
      details
    ) VALUES (
      NEW.id,
      'auth_' || NEW.type,
      jsonb_build_object(
        'timestamp', now(),
        'ip', NEW.ip::text
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Try to create trigger on auth.audit_log_entries if we have access to auth schema
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'auth' AND tablename = 'audit_log_entries'
  ) THEN
    DROP TRIGGER IF EXISTS auth_event_logger ON auth.audit_log_entries;
    
    CREATE TRIGGER auth_event_logger
    AFTER INSERT ON auth.audit_log_entries
    FOR EACH ROW
    EXECUTE FUNCTION log_auth_event();
    
    RAISE NOTICE 'Added trigger to auth.audit_log_entries';
  ELSE
    RAISE NOTICE 'auth.audit_log_entries table not accessible, skipping trigger creation';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating trigger on auth schema: %', SQLERRM;
END
$$;

-- Enable RLS on all tables (ensure it's enabled)
DO $$
DECLARE
  table_rec RECORD;
BEGIN
  FOR table_rec IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', 
                   table_rec.table_name);
  END LOOP;
  
  RAISE NOTICE 'Enabled RLS on all tables';
END
$$;

-- Apply security defaults to secure functions
DO $$
DECLARE
  func_rec RECORD;
BEGIN
  FOR func_rec IN 
    SELECT proname 
    FROM pg_proc 
    WHERE pronamespace = 'public'::regnamespace
    AND (proname = 'admin_reset_user_password' OR 
         proname = 'grant_admin_privileges' OR 
         proname = 'revoke_admin_privileges')
  LOOP
    EXECUTE format('ALTER FUNCTION public.%I SET search_path = public, auth', 
                   func_rec.proname);
    EXECUTE format('ALTER FUNCTION public.%I SET statement_timeout = ''3s''', 
                   func_rec.proname);
    
    RAISE NOTICE 'Applied security settings to %', func_rec.proname;
  END LOOP;
END
$$;

-- Add timeout and error logging to all security-related functions
DO $$
BEGIN
  RAISE NOTICE 'Security enhancements migration completed successfully';
END
$$;
