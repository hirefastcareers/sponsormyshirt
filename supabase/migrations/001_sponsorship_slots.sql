-- =============================================================================
-- Great North Run — Sponsorship Slots
-- Run this in the Supabase SQL Editor (or via supabase db push).
-- Idempotent: safe to re-run; seed uses ON CONFLICT DO UPDATE.
-- =============================================================================

-- 1. Core table ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sponsorship_slots (
  id               text PRIMARY KEY,
  slot_name        text NOT NULL,
  category         text NOT NULL CHECK (category IN ('shirt', 'shorts', 'socks', 'headwear')),
  price_gbp        integer NOT NULL CHECK (price_gbp > 0),
  status           text NOT NULL DEFAULT 'available'
                     CHECK (status IN ('available', 'pending', 'sold')),
  sponsor_name     text,
  sponsor_url      text,
  sponsor_logo_url text,
  x_position       double precision NOT NULL CHECK (x_position >= 0 AND x_position <= 100),
  y_position       double precision NOT NULL CHECK (y_position >= 0 AND y_position <= 100),
  dodo_product_id  text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- Keep updated_at fresh on every write
CREATE OR REPLACE FUNCTION public.set_sponsorship_slots_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sponsorship_slots_updated_at ON public.sponsorship_slots;
CREATE TRIGGER trg_sponsorship_slots_updated_at
  BEFORE UPDATE ON public.sponsorship_slots
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_sponsorship_slots_updated_at();

-- 2. Row Level Security --------------------------------------------------------
ALTER TABLE public.sponsorship_slots ENABLE ROW LEVEL SECURITY;

-- Public read: landing page needs to list slots (anon key)
DROP POLICY IF EXISTS "Public read sponsorship slots" ON public.sponsorship_slots;
CREATE POLICY "Public read sponsorship slots"
  ON public.sponsorship_slots
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Writes only via service role (API routes) — no INSERT/UPDATE/DELETE for anon

-- 3. Storage bucket for sponsor logos ------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'sponsor-logos',
  'sponsor-logos',
  true,
  5242880, -- 5 MB
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'image/svg']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Allow anyone to upload logos (landing page checkout flow)
DROP POLICY IF EXISTS "Anyone can upload sponsor logos" ON storage.objects;
CREATE POLICY "Anyone can upload sponsor logos"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'sponsor-logos');

DROP POLICY IF EXISTS "Public read sponsor logos" ON storage.objects;
CREATE POLICY "Public read sponsor logos"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'sponsor-logos');

-- 4. Seed slots (idempotent) ---------------------------------------------------
-- x/y are percentages within the KitVisualizer SVG viewBox overlay (0–100).
-- After creating products in the Dodo dashboard, UPDATE dodo_product_id for each row.
INSERT INTO public.sponsorship_slots (
  id, slot_name, category, price_gbp, status,
  x_position, y_position, dodo_product_id
)
VALUES
  ('chest_center',  'Chest Center',       'shirt',    350, 'available', 50.0, 28.0, NULL),
  ('left_chest',    'Left Chest / Heart', 'shirt',    250, 'available', 38.0, 30.0, NULL),
  ('upper_back',    'Upper Back',         'shirt',    200, 'available', 72.0, 26.0, NULL),
  ('lower_back',    'Lower Back',         'shirt',    150, 'available', 72.0, 42.0, NULL),
  ('cap_front',     'Cap Front',          'headwear', 100, 'available', 22.0, 12.0, NULL),
  ('shorts_left',   'Shorts Left Leg',    'shorts',    90, 'available', 42.0, 62.0, NULL),
  ('left_sock',     'Left Sock',          'socks',     50, 'available', 38.0, 88.0, NULL),
  ('right_sock',    'Right Sock',         'socks',     50, 'available', 52.0, 88.0, NULL)
ON CONFLICT (id) DO UPDATE SET
  slot_name   = EXCLUDED.slot_name,
  category    = EXCLUDED.category,
  price_gbp   = EXCLUDED.price_gbp,
  x_position  = EXCLUDED.x_position,
  y_position  = EXCLUDED.y_position;
  -- NOTE: status / sponsor_* / dodo_product_id are intentionally NOT overwritten
  -- so re-running the seed never clobbers live sales or configured product IDs.
