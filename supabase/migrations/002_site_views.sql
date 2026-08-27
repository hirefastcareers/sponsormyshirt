-- =============================================================================
-- Site view counter (single-row stats)
-- Idempotent: safe to re-run.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.site_views (
  id           integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  total_views  bigint NOT NULL DEFAULT 0 CHECK (total_views >= 0),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.site_views (id, total_views)
VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

-- Atomic increment — avoids lost updates under concurrent visits
CREATE OR REPLACE FUNCTION public.increment_site_views()
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_total bigint;
BEGIN
  UPDATE public.site_views
  SET total_views = total_views + 1,
      updated_at = now()
  WHERE id = 1
  RETURNING total_views INTO new_total;

  IF new_total IS NULL THEN
    INSERT INTO public.site_views (id, total_views)
    VALUES (1, 1)
    ON CONFLICT (id) DO UPDATE
      SET total_views = public.site_views.total_views + 1,
          updated_at = now()
    RETURNING total_views INTO new_total;
  END IF;

  RETURN new_total;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_site_views() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_site_views() TO service_role;

ALTER TABLE public.site_views ENABLE ROW LEVEL SECURITY;

-- No anon read/write — only service role via /api/visits
DROP POLICY IF EXISTS "No public access to site_views" ON public.site_views;
-- Intentionally no policies: anon/authenticated cannot SELECT/UPDATE
