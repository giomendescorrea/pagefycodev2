-- Migration: Book Views Counter Function
-- Description: Creates a function to increment book views atomically
-- Date: 2025-11-11

-- Create function to increment book views
CREATE OR REPLACE FUNCTION increment_book_views(book_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE books
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = book_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_book_views(UUID) TO authenticated;

-- Grant execute permission to anon users (for public book viewing)
GRANT EXECUTE ON FUNCTION increment_book_views(UUID) TO anon;

-- Add helpful comment
COMMENT ON FUNCTION increment_book_views IS 'Atomically increments the views_count for a book. Safe for concurrent access.';
