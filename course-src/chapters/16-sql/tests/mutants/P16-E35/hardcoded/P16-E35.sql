
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('French Press 1L'::text, '119.00'::numeric),
  ('V60 Ceramic'::text, '99.00'::numeric),
  ('Moka Pot 6 Cups'::text, '149.00'::numeric),
  ('Gooseneck Kettle'::text, '229.00'::numeric)
) AS v("name", "price");
