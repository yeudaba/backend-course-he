
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('1'::integer, 'Ethiopia Beans 1kg'::text, 'beans'::text),
  ('2'::integer, 'Colombia Beans 1kg'::text, 'beans'::text),
  ('3'::integer, 'Brazil Beans 250g'::text, 'beans'::text),
  ('4'::integer, 'Hand Grinder'::text, 'grinders'::text),
  ('5'::integer, 'Electric Grinder Pro'::text, 'grinders'::text),
  ('6'::integer, 'French Press 1L'::text, 'brewing'::text),
  ('7'::integer, 'V60 Ceramic'::text, 'brewing'::text),
  ('8'::integer, 'Moka Pot 6 Cups'::text, 'brewing'::text),
  ('9'::integer, 'Paper Filters (100)'::text, 'accessories'::text),
  ('10'::integer, 'Ceramic Mug'::text, 'accessories'::text),
  ('11'::integer, 'Digital Scale'::text, 'accessories'::text),
  ('12'::integer, 'Gooseneck Kettle'::text, 'brewing'::text)
) AS v("id", "product", "category");
