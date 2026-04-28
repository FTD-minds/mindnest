-- Add preferred_voice to profiles so users can set their Nest voice in Profile settings
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS preferred_voice TEXT DEFAULT 'Sarah';
