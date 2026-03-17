-- Create profiles table to store avatar URLs
CREATE TABLE profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  avatar_url text
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read any profile (for member avatars)
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Users can only upsert their own profile
CREATE POLICY "profiles_upsert" ON profiles
  FOR ALL USING (auth.uid() = id);
