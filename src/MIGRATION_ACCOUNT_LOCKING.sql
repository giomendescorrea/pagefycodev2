-- Migration: Add account locking fields to profiles table
-- Run this SQL in your Supabase SQL Editor

-- Add columns for account locking feature
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_is_locked ON profiles(is_locked);
CREATE INDEX IF NOT EXISTS idx_profiles_email_locked ON profiles(email, is_locked);

-- Add comment to document the columns
COMMENT ON COLUMN profiles.is_locked IS 'Whether the account is locked due to failed login attempts';
COMMENT ON COLUMN profiles.failed_login_attempts IS 'Number of consecutive failed login attempts';
COMMENT ON COLUMN profiles.locked_at IS 'Timestamp when the account was locked';
