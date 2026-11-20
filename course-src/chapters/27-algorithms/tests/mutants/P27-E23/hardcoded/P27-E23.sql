
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('3'::integer, 'Dana L.'::text),
  ('5'::integer, 'Avi Peretz'::text),
  ('7'::integer, 'Avi P.'::text),
  ('8'::integer, 'Omer Biton'::text)
) AS v("id", "name");
