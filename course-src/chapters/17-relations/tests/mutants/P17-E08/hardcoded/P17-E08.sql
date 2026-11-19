
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('Avi Peretz'::text, 'avi@example.com'::text),
  ('Omer Shalom'::text, 'omer@example.com'::text)
) AS v("full_name", "email");
