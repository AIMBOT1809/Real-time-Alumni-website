-- Optional, backwards-compatible upgrade for post review and contribution tracking.
-- Existing posts remain public and are marked approved.

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS rejection_reason text,
  ADD COLUMN IF NOT EXISTS reviewed_by text,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

UPDATE public.posts
SET status = 'approved'
WHERE status IS NULL;

ALTER TABLE public.posts
  ALTER COLUMN status SET DEFAULT 'pending';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'posts_status_check'
      AND conrelid = 'public.posts'::regclass
  ) THEN
    ALTER TABLE public.posts
      ADD CONSTRAINT posts_status_check
      CHECK (status IN ('pending', 'approved', 'rejected'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS posts_alumni_id_created_at_idx
  ON public.posts (alumni_id, created_at DESC);

CREATE INDEX IF NOT EXISTS posts_status_created_at_idx
  ON public.posts (status, created_at DESC);
