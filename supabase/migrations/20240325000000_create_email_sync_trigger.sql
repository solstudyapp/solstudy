-- Function to copy email from auth.users to user_profiles
CREATE OR REPLACE FUNCTION sync_user_email()
RETURNS TRIGGER AS $$
BEGIN
  -- For insert or update operations
  IF (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.email IS DISTINCT FROM NEW.email)) THEN
    -- Insert into user_profiles if it doesn't exist, update if it does
    INSERT INTO public.user_profiles (user_id, email)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (user_id) 
    DO UPDATE SET email = NEW.email;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it already exists to avoid errors on re-runs
DROP TRIGGER IF EXISTS on_auth_user_created_or_updated ON auth.users;

-- Create trigger that fires on user creation or update
CREATE TRIGGER on_auth_user_created_or_updated
AFTER INSERT OR UPDATE OF email ON auth.users
FOR EACH ROW
EXECUTE FUNCTION sync_user_email();

-- Backfill existing users (one-time operation)
INSERT INTO public.user_profiles (user_id, email)
SELECT id, email FROM auth.users
ON CONFLICT (user_id) 
DO UPDATE SET email = EXCLUDED.email; 