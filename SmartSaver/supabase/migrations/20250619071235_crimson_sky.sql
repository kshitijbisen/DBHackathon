/*
  # Create avatars storage bucket with RLS policies

  1. Storage Setup
    - Create 'avatars' storage bucket if it doesn't exist
    - Enable RLS on the avatars bucket
    
  2. Security Policies
    - Allow authenticated users to upload their own avatars
    - Allow authenticated users to view their own avatars
    - Allow authenticated users to update their own avatars
    - Allow authenticated users to delete their own avatars
    
  3. Public Access
    - Allow public read access to avatar files (for profile display)
*/

-- Create the avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on the avatars bucket
UPDATE storage.buckets 
SET public = true 
WHERE id = 'avatars';

-- Create policy for authenticated users to upload their own avatars
CREATE POLICY "Users can upload their own avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = 'avatars'
  AND auth.uid()::text = (storage.filename(name) LIKE auth.uid()::text || '-%')::text
);

-- Create policy for authenticated users to view their own avatars
CREATE POLICY "Users can view their own avatars"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = 'avatars'
);

-- Create policy for public read access to avatars
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE polname = 'Public can view avatars'
      AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Public can view avatars"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'avatars');
  END IF;
END
$$;


-- Create policy for authenticated users to update their own avatars
CREATE POLICY "Users can update their own avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = 'avatars'
  AND auth.uid()::text = (storage.filename(name) LIKE auth.uid()::text || '-%')::text
);

-- Create policy for authenticated users to delete their own avatars
CREATE POLICY "Users can delete their own avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = 'avatars'
  AND auth.uid()::text = (storage.filename(name) LIKE auth.uid()::text || '-%')::text
);