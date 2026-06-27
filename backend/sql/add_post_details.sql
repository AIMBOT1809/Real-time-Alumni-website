-- Add post_details column to posts table
ALTER TABLE public.posts 
  ADD COLUMN IF NOT EXISTS post_details JSONB;

-- Create index for better query performance on JSONB fields
CREATE INDEX IF NOT EXISTS idx_posts_post_details ON public.posts USING GIN (post_details);

-- Comment on column
COMMENT ON COLUMN public.posts.post_details IS 'Stores dynamic fields based on post type (job, internship, business, referral, etc.)';