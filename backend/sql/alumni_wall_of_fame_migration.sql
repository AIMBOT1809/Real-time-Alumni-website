-- ============================================================
-- Alumni Wall of Fame — Supabase Migration
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Add Wall of Fame columns to alumni_profiles table
ALTER TABLE public.alumni_profiles
  ADD COLUMN IF NOT EXISTS wall_of_fame_status TEXT DEFAULT 'not_submitted',
  ADD COLUMN IF NOT EXISTS is_wall_of_fame BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_hidden_from_wall BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS wall_of_fame_rejection_reason TEXT;

-- Update existing rows to have consistent default values
UPDATE public.alumni_profiles
SET 
  wall_of_fame_status = COALESCE(wall_of_fame_status, 'not_submitted'),
  is_wall_of_fame = COALESCE(is_wall_of_fame, false),
  is_hidden_from_wall = COALESCE(is_hidden_from_wall, false)
WHERE wall_of_fame_status IS NULL;

-- Enable Row Level Security if not already enabled
ALTER TABLE public.alumni_profiles ENABLE ROW LEVEL SECURITY;

-- Allow public read access for Wall of Fame (landing page is public)
CREATE POLICY IF NOT EXISTS "public_wall_of_fame_read" ON public.alumni_profiles
  FOR SELECT USING (true);

-- Allow authenticated alumni to insert their own profile
CREATE POLICY IF NOT EXISTS "alumni_insert_own" ON public.alumni_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own profile
CREATE POLICY IF NOT EXISTS "alumni_update_own" ON public.alumni_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Enable realtime for alumni_profiles table
ALTER PUBLICATION supabase_realtime ADD TABLE public.alumni_profiles;
