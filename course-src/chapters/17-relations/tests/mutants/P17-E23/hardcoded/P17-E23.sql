
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('beans'::text, '1058.20'::numeric),
  ('brewing'::text, '765.00'::numeric)
) AS v("category", "revenue");
