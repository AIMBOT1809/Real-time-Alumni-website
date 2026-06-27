-- Create alumni_highlights table
CREATE TABLE IF NOT EXISTS public.alumni_highlights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'Alumni Meet',
    'Discussion',
    'Guidance Session',
    'Webinar',
    'Guest Lecture',
    'Event Memories',
    'Other'
  )),
  date DATE NOT NULL,
  location TEXT,
  images TEXT[] NOT NULL DEFAULT '{}',
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_alumni_highlights_published ON alumni_highlights(published, date DESC);
CREATE INDEX IF NOT EXISTS idx_alumni_highlights_created_by ON alumni_highlights(created_by);

-- Enable Row Level Security
ALTER TABLE public.alumni_highlights ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage all highlights
CREATE POLICY "Admins can manage all highlights"
  ON alumni_highlights
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create policy for public to view published highlights
CREATE POLICY "Public can view published highlights"
  ON alumni_highlights
  FOR SELECT
  TO anon, authenticated
  USING (published = true);

-- Create policy for authenticated users to create highlights (optional - adjust as needed)
CREATE POLICY "Authenticated users can create highlights"
  ON alumni_highlights
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Grant permissions
GRANT ALL ON alumni_highlights TO authenticated;
GRANT SELECT ON alumni_highlights TO anon;