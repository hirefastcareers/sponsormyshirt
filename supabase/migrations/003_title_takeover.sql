-- =============================================================================
-- Title Sponsor / Whole Kit Takeover
-- Idempotent: safe to re-run.
-- =============================================================================

-- Allow a dedicated category for the master takeover product
ALTER TABLE public.sponsorship_slots
  DROP CONSTRAINT IF EXISTS sponsorship_slots_category_check;

ALTER TABLE public.sponsorship_slots
  ADD CONSTRAINT sponsorship_slots_category_check
  CHECK (category IN ('shirt', 'shorts', 'socks', 'headwear', 'takeover'));

INSERT INTO public.sponsorship_slots (
  id, slot_name, category, price_gbp, status,
  x_position, y_position, dodo_product_id
)
VALUES (
  'title_takeover',
  'Title Sponsor / Whole Kit Takeover',
  'takeover',
  1200,
  'available',
  50.0,
  50.0,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  slot_name  = EXCLUDED.slot_name,
  category   = EXCLUDED.category,
  price_gbp  = EXCLUDED.price_gbp;
  -- status / sponsor_* / dodo_product_id intentionally preserved

-- Hold every slot as pending for a title-takeover checkout (atomic).
-- Returns true only when 100% of rows were available and are now pending.
CREATE OR REPLACE FUNCTION public.hold_title_takeover(
  p_sponsor_name text,
  p_sponsor_url text,
  p_logo_path text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_count integer;
  held_count integer;
BEGIN
  SELECT COUNT(*) INTO total_count FROM public.sponsorship_slots;

  IF total_count = 0 THEN
    RETURN false;
  END IF;

  -- Bail if anything is already spoken for
  IF EXISTS (
    SELECT 1 FROM public.sponsorship_slots WHERE status <> 'available'
  ) THEN
    RETURN false;
  END IF;

  UPDATE public.sponsorship_slots
  SET
    status = 'pending',
    sponsor_name = p_sponsor_name,
    sponsor_url = p_sponsor_url,
    sponsor_logo_url = p_logo_path
  WHERE status = 'available';

  GET DIAGNOSTICS held_count = ROW_COUNT;

  IF held_count <> total_count THEN
    -- Should be unreachable after the EXISTS guard; roll back via exception
    RAISE EXCEPTION 'title_takeover hold race: held % of %', held_count, total_count;
  END IF;

  RETURN true;
END;
$$;

-- Mark every sponsorship slot sold in one transaction (title takeover fulfilment).
CREATE OR REPLACE FUNCTION public.fulfil_title_takeover(
  p_sponsor_name text,
  p_sponsor_url text,
  p_sponsor_logo_url text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.sponsorship_slots
  SET
    status = 'sold',
    sponsor_name = p_sponsor_name,
    sponsor_url = p_sponsor_url,
    sponsor_logo_url = p_sponsor_logo_url;
END;
$$;

-- Release a failed title-takeover hold (Dodo session creation failed).
CREATE OR REPLACE FUNCTION public.release_title_takeover_hold()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.sponsorship_slots
  SET
    status = 'available',
    sponsor_name = NULL,
    sponsor_url = NULL,
    sponsor_logo_url = NULL
  WHERE status = 'pending';
END;
$$;

REVOKE ALL ON FUNCTION public.hold_title_takeover(text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fulfil_title_takeover(text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.release_title_takeover_hold() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.hold_title_takeover(text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.fulfil_title_takeover(text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.release_title_takeover_hold() TO service_role;
