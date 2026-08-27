-- =============================================================================
-- Optional checkout upsells: social announcement + dofollow SEO backlink
-- Idempotent: safe to re-run.
-- =============================================================================

ALTER TABLE public.sponsorship_slots
  ADD COLUMN IF NOT EXISTS has_social_post boolean NOT NULL DEFAULT false;

ALTER TABLE public.sponsorship_slots
  ADD COLUMN IF NOT EXISTS has_dofollow_link boolean NOT NULL DEFAULT false;

-- Hold every slot as pending for a title-takeover checkout (atomic).
-- Returns true only when 100% of rows were available and are now pending.
DROP FUNCTION IF EXISTS public.hold_title_takeover(text, text, text);
CREATE OR REPLACE FUNCTION public.hold_title_takeover(
  p_sponsor_name text,
  p_sponsor_url text,
  p_logo_path text,
  p_has_social_post boolean DEFAULT false,
  p_has_dofollow_link boolean DEFAULT false
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
    sponsor_logo_url = p_logo_path,
    has_social_post = COALESCE(p_has_social_post, false),
    has_dofollow_link = COALESCE(p_has_dofollow_link, false)
  WHERE status = 'available';

  GET DIAGNOSTICS held_count = ROW_COUNT;

  IF held_count <> total_count THEN
    RAISE EXCEPTION 'title_takeover hold race: held % of %', held_count, total_count;
  END IF;

  RETURN true;
END;
$$;

-- Mark every sponsorship slot sold in one transaction (title takeover fulfilment).
DROP FUNCTION IF EXISTS public.sell_title_takeover(text, text, text);
CREATE OR REPLACE FUNCTION public.sell_title_takeover(
  p_sponsor_name text,
  p_sponsor_url text,
  p_sponsor_logo_url text,
  p_has_social_post boolean DEFAULT false,
  p_has_dofollow_link boolean DEFAULT false
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
    sponsor_logo_url = p_sponsor_logo_url,
    has_social_post = COALESCE(p_has_social_post, false),
    has_dofollow_link = COALESCE(p_has_dofollow_link, false);
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
    sponsor_logo_url = NULL,
    has_social_post = false,
    has_dofollow_link = false
  WHERE status = 'pending';
END;
$$;

REVOKE ALL ON FUNCTION public.hold_title_takeover(text, text, text, boolean, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.sell_title_takeover(text, text, text, boolean, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.release_title_takeover_hold() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.hold_title_takeover(text, text, text, boolean, boolean) TO service_role;
GRANT EXECUTE ON FUNCTION public.sell_title_takeover(text, text, text, boolean, boolean) TO service_role;
GRANT EXECUTE ON FUNCTION public.release_title_takeover_hold() TO service_role;
