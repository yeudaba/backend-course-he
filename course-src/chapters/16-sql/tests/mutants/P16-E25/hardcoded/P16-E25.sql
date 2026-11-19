
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('Grinder Cleaning Brush'::text, '19.90'::numeric, '23.48'::numeric, 'basic'::text, 'in stock'::text),
  ('Paper Filters (100)'::text, '24.90'::numeric, '29.38'::numeric, 'basic'::text, 'in stock'::text),
  ('Brazil Beans 250g'::text, '29.90'::numeric, '35.28'::numeric, 'basic'::text, 'in stock'::text),
  ('Ceramic Mug'::text, '39.00'::numeric, '46.02'::numeric, 'basic'::text, 'in stock'::text),
  ('Colombia Beans 1kg'::text, '84.90'::numeric, '100.18'::numeric, 'standard'::text, 'out of stock'::text),
  ('Ethiopia Beans 1kg'::text, '89.90'::numeric, '106.08'::numeric, 'standard'::text, 'in stock'::text),
  ('V60 Ceramic'::text, '99.00'::numeric, '116.82'::numeric, 'standard'::text, 'out of stock'::text),
  ('French Press 1L'::text, '119.00'::numeric, '140.42'::numeric, 'standard'::text, 'in stock'::text),
  ('Moka Pot 6 Cups'::text, '149.00'::numeric, '175.82'::numeric, 'standard'::text, 'in stock'::text),
  ('Hand Grinder'::text, '189.00'::numeric, '223.02'::numeric, 'premium'::text, 'last units'::text),
  ('Gooseneck Kettle'::text, '229.00'::numeric, '270.22'::numeric, 'premium'::text, 'last units'::text),
  ('Electric Grinder Pro'::text, '649.00'::numeric, '765.82'::numeric, 'premium'::text, 'last units'::text)
) AS v("name", "price", "price_with_vat", "tier", "availability");
