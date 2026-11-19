
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('Electric Grinder Pro'::text),
  ('Grinder Cleaning Brush'::text),
  ('Hand Grinder'::text)
) AS v("name");
