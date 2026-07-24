-- ============================================================
-- Alumni Association Fields Migration
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Add alumni association columns to alumni_profiles table
ALTER TABLE public.alumni_profiles
  ADD COLUMN IF NOT EXISTS alumni_association_member TEXT,
  ADD COLUMN IF NOT EXISTS contribution_area TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.alumni_profiles.alumni_association_member IS 'Whether the alumni wants to be a member of the Alumni Association (Yes/No)';
COMMENT ON COLUMN public.alumni_profiles.contribution_area IS 'Area in which the alumni can contribute to TKRCETians';