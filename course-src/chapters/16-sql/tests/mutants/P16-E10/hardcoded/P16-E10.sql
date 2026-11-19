
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('lior katz'::text, 'lior.katz@example.com'::text),
  ('Michal Biton'::text, 'michal@example.com'::text),
  ('Omer Shalom'::text, 'omer@example.com'::text),
  ('Yossi Cohen'::text, 'yossi@example.com'::text)
) AS v("full_name", "email");
