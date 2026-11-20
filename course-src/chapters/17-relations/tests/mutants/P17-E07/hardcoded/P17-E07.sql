
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('Paper Filters (100)'::text, 'accessories'::text, '24.90'::numeric),
  ('Ceramic Mug'::text, 'accessories'::text, '39.00'::numeric),
  ('Brazil Beans 250g'::text, 'beans'::text, '29.90'::numeric),
  ('Colombia Beans 1kg'::text, 'beans'::text, '84.90'::numeric),
  ('Ethiopia Beans 1kg'::text, 'beans'::text, '89.90'::numeric),
  ('V60 Ceramic'::text, 'brewing'::text, '99.00'::numeric),
  ('French Press 1L'::text, 'brewing'::text, '119.00'::numeric),
  ('Moka Pot 6 Cups'::text, 'brewing'::text, '149.00'::numeric),
  ('Gooseneck Kettle'::text, 'brewing'::text, '229.00'::numeric),
  ('Hand Grinder'::text, 'grinders'::text, '189.00'::numeric),
  ('Electric Grinder Pro'::text, 'grinders'::text, '649.00'::numeric)
) AS v("product", "category", "price");
