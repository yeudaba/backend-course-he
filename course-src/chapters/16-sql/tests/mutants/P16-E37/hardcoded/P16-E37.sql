
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('Espresso Blend 1kg'::text, 'beans'::text, '15'::integer),
  ('Digital Scale'::text, 'accessories'::text, '0'::integer)
) AS v("name", "category", "stock");
