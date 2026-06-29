-- ============================================================
-- Entrepreneur / Startup Founder Fields Migration
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Add entrepreneur-specific columns to alumni_profiles table
ALTER TABLE alumni_profiles
  ADD COLUMN IF NOT EXISTS "Startup_Name" TEXT,
  ADD COLUMN IF NOT EXISTS "Founder_Role" TEXT,
  ADD COLUMN IF NOT EXISTS "Industry" TEXT,
  ADD COLUMN IF NOT EXISTS "Year_Founded" TEXT,
  ADD COLUMN IF NOT EXISTS "Website" TEXT,
  ADD COLUMN IF NOT EXISTS "Location" TEXT,
  ADD COLUMN IF NOT EXISTS "Employee_Count" TEXT,
  ADD COLUMN IF NOT EXISTS "Startup_Stage" TEXT,
  ADD COLUMN IF NOT EXISTS "Looking_For" TEXT,
  ADD COLUMN IF NOT EXISTS "Startup_Description" TEXT,
  ADD COLUMN IF NOT EXISTS "Business_Verification_URL" TEXT;

-- Create storage bucket for business verification documents
-- Note: This needs to be created via Supabase Dashboard → Storage
-- Bucket name: business-verifications
-- Set as PUBLIC for easy access
-- Or use the SQL below if your Supabase version supports it:

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-verifications',
  'business-verifications',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies for business-verifications bucket
-- Allow public read access
CREATE POLICY "Public Read Access for business-verifications"
ON storage.objects FOR SELECT
USING (bucket_id = 'business-verifications');

-- Allow authenticated uploads
CREATE POLICY "Authenticated Upload for business-verifications"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'business-verifications'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated updates
CREATE POLICY "Authenticated Update for business-verifications"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'business-verifications'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated deletes
CREATE POLICY "Authenticated Delete for business-verifications"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'business-verifications'
  AND auth.role() = 'authenticated'
);