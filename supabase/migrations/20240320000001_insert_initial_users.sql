-- Insert user profiles for existing users
INSERT INTO public.user_profiles (
  user_id, 
  full_name, 
  email,  -- Adding email field since we can't rely on auth.users
  points, 
  lessons_completed, 
  last_activity, 
  is_active
)
VALUES
  -- Admin user
  ('faa797eb-1133-4dbe-8b45-56a7d7cb0abd', 
   'Admin',
   'admin@solstudy.com',
   0, 
   0, 
   '2025-03-10T20:50:09.000Z',
   true),
  
  -- Andrew's user profile
  ('291867cb-bca3-4d2e-a609-79cea516e9c29', 
   'Andrew Casal',
   'andrewjcasal1@gmail.com',
   0, 
   0, 
   '2025-03-10T20:23:01.000Z',
   true)
ON CONFLICT (user_id) DO UPDATE 
SET 
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  last_activity = EXCLUDED.last_activity,
  updated_at = now(),
  is_active = EXCLUDED.is_active; 