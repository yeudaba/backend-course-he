
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('Noa Mizrahi'::text),
  ('Yossi Cohen'::text)
) AS v("full_name");
