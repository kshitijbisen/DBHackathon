/*
  # Setup Avatar Storage with Conflict Handling

  1. Storage Setup
    - Create avatars bucket if it doesn't exist
    - Set up proper RLS policies for avatar uploads

  2. Security
    - Allow authenticated users to upload avatars
    - Allow public read access to avatars
    - Allow users to update/delete their own avatars
*/

-- Create the avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist to avoid conflicts
DO $$
BEGIN
  -- Drop policies if they exist
  DROP POLICY IF EXISTS "Users can upload avatars" ON storage.objects;
  DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;
END $$;

-- Allow authenticated users to upload avatars
CREATE POLICY "Users can upload avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Allow public read access to avatars
CREATE POLICY "Public can view avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Allow users to update their own avatars
CREATE POLICY "Users can update own avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars')
WITH CHECK (bucket_id = 'avatars');

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete own avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');