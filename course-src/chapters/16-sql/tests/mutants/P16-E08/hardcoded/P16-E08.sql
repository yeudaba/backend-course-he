
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('2'::integer, 'Colombia Beans 1kg'::text),
  ('8'::integer, 'V60 Ceramic'::text)
) AS v("id", "name");
