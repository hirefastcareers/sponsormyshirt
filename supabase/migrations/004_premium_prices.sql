-- =============================================================================
-- Premium rate card prices + Shorts Right Leg placement
-- Idempotent: safe to re-run. Matches lib/positions.ts POSITION_PRICES.
-- =============================================================================

INSERT INTO public.sponsorship_slots (
  id, slot_name, category, price_gbp, status,
  x_position, y_position, dodo_product_id
)
VALUES
  ('chest_center',  'Chest Center',        'shirt',    1200, 'available', 42.0, 31.0, NULL),
  ('left_chest',    'Left Chest / Heart',  'shirt',     650, 'available', 18.5, 29.0, NULL),
  ('upper_back',    'Upper Back',          'shirt',     500, 'available', 71.5, 29.0, NULL),
  ('lower_back',    'Lower Back',          'shirt',     350, 'available', 71.5, 40.0, NULL),
  ('cap_front',     'Cap Front',           'headwear',  300, 'available', 25.0,  9.5, NULL),
  ('shorts_left',   'Shorts Left Leg',     'shorts',    250, 'available', 38.5, 65.5, NULL),
  ('shorts_right',  'Shorts Right Leg',    'shorts',    250, 'available', 61.5, 65.5, NULL),
  ('right_sleeve',  'Right Sleeve',        'shirt',     200, 'available', 40.0, 25.0, NULL),
  ('left_sleeve',   'Left Sleeve',         'shirt',     200, 'available',  9.0, 25.0, NULL),
  ('left_sock',     'Left Sock',           'socks',     100, 'available', 38.5, 87.5, NULL),
  ('right_sock',    'Right Sock',          'socks',     100, 'available', 51.0, 87.5, NULL)
ON CONFLICT (id) DO UPDATE SET
  slot_name  = EXCLUDED.slot_name,
  category   = EXCLUDED.category,
  price_gbp  = EXCLUDED.price_gbp,
  x_position = EXCLUDED.x_position,
  y_position = EXCLUDED.y_position;
  -- status / sponsor_* / dodo_product_id intentionally preserved
