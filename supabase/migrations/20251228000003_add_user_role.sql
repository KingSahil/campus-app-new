-- Add role column to user_profiles table
ALTER TABLE user_profiles 
  ADD COLUMN IF NOT EXISTS role text DEFAULT 'student' CHECK (role IN ('student', 'instructor'));

-- Create index for role lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
