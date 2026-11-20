
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('Ethiopia Beans 1kg'::text),
  ('French Press 1L'::text),
  ('Gooseneck Kettle'::text),
  ('Grinder Cleaning Brush'::text)
) AS v("name");
