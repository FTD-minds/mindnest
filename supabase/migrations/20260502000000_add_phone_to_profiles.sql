-- Add optional phone number to user profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS phone TEXT;
