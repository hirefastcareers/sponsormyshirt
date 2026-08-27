-- =============================================================================
-- Micro-Sponsor Wall — £2 logo placements in page gutters / mobile marquee
-- Idempotent: safe to re-run.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.micro_sponsors (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  logo_url     text NOT NULL,
  link_url     text NOT NULL,
  amount_paid  integer NOT NULL DEFAULT 2 CHECK (amount_paid > 0),
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_micro_sponsors_created_at
  ON public.micro_sponsors (created_at DESC);

-- Row Level Security -----------------------------------------------------------
ALTER TABLE public.micro_sponsors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read micro sponsors" ON public.micro_sponsors;
CREATE POLICY "Public read micro sponsors"
  ON public.micro_sponsors
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Writes only via service role (checkout webhook / API routes)
