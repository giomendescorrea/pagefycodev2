-- Migration: Add unlock_requests table
-- Description: Creates a table to store user unlock requests when accounts are blocked
-- Date: 2025-01-10
-- Updated: 2025-11-10 - Fixed RLS policies for automatic request creation

-- Create unlock_requests table
CREATE TABLE IF NOT EXISTS unlock_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint with explicit name to profiles table
ALTER TABLE unlock_requests 
  DROP CONSTRAINT IF EXISTS unlock_requests_user_id_fkey;

ALTER TABLE unlock_requests 
  ADD CONSTRAINT unlock_requests_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_unlock_requests_user_id ON unlock_requests(user_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_unlock_requests_status ON unlock_requests(status);

-- Enable Row Level Security
ALTER TABLE unlock_requests ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can create unlock requests" ON unlock_requests;
DROP POLICY IF EXISTS "Users can view own unlock requests" ON unlock_requests;
DROP POLICY IF EXISTS "Admins can view all unlock requests" ON unlock_requests;
DROP POLICY IF EXISTS "Admins can update unlock requests" ON unlock_requests;
DROP POLICY IF EXISTS "Admins can delete unlock requests" ON unlock_requests;
DROP POLICY IF EXISTS "Service role can create unlock requests" ON unlock_requests;
DROP POLICY IF EXISTS "Users and admins can create unlock requests" ON unlock_requests;
DROP POLICY IF EXISTS "Anyone can create unlock requests for locked accounts" ON unlock_requests;

-- Policy 1: Anyone can create unlock requests for locked accounts
-- This allows the system to create requests automatically during login failures
CREATE POLICY "Anyone can create unlock requests for locked accounts"
  ON unlock_requests
  FOR INSERT
  WITH CHECK (
    -- Check if target user is actually locked
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = user_id
      AND profiles.is_locked = true
    )
  );

-- Policy 2: Admins can create unlock requests for any user
CREATE POLICY "Admins can create unlock requests for any user"
  ON unlock_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Users can view their own unlock requests
CREATE POLICY "Users can view own unlock requests"
  ON unlock_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Admins can view all unlock requests
CREATE POLICY "Admins can view all unlock requests"
  ON unlock_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can update unlock requests
CREATE POLICY "Admins can update unlock requests"
  ON unlock_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins can delete unlock requests
CREATE POLICY "Admins can delete unlock requests"
  ON unlock_requests
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create a helper function that admins can use to create unlock requests
-- This bypasses RLS by running with SECURITY DEFINER (runs as the function owner)
CREATE OR REPLACE FUNCTION create_unlock_request_as_admin(
  target_user_id UUID,
  request_reason TEXT
)
RETURNS unlock_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_request unlock_requests;
  is_admin BOOLEAN;
BEGIN
  -- Check if caller is admin
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  ) INTO is_admin;

  IF NOT is_admin THEN
    RAISE EXCEPTION 'Only admins can create unlock requests for other users';
  END IF;

  -- Insert the unlock request
  INSERT INTO unlock_requests (user_id, reason, status)
  VALUES (target_user_id, request_reason, 'pending')
  RETURNING * INTO new_request;

  RETURN new_request;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_unlock_request_as_admin(UUID, TEXT) TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION create_unlock_request_as_admin IS 'Allows admins to create unlock requests for locked users. Bypasses RLS.';