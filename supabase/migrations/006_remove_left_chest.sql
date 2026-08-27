-- =============================================================================
-- Remove Left Chest / Heart placement; recenter Chest Center as high/bib slot.
-- Idempotent: safe to re-run. Matches lib/positions.ts + lib/zones.ts.
-- =============================================================================

-- Drop the retired heart-side placement (also stops Dodo catalogue sync).
DELETE FROM public.sponsorship_slots
WHERE id = 'left_chest';

-- Refresh chest center label + overlay coords for the high / race-bib band.
UPDATE public.sponsorship_slots
SET
  slot_name  = 'Chest Center (High / Bib)',
  x_position = 50.0,
  y_position = 42.0,
  price_gbp  = 1200
WHERE id = 'chest_center';

-- Keep title takeover price aligned with sum of remaining placements (£3,450)
-- when it was previously the auto-sum (£4,100). Preserve sold/pending status.
UPDATE public.sponsorship_slots
SET
  slot_name = 'Title Sponsor / Whole Kit Takeover',
  price_gbp = 3450
WHERE id = 'title_takeover'
  AND status = 'available';
