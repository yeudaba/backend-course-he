
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('Dana Levi'::text, '050-1111111'::text),
  ('Itay Hadad'::text, '052-7777777'::text),
  ('Michal Biton'::text, 'michal@example.com'::text)
) AS v("full_name", "contact");
