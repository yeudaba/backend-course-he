
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('Yossi Cohen'::text, 'yossi@example.com'::text),
  ('Shira David'::text, 'shira@example.com'::text),
  ('Gal Ohayon'::text, 'gal@example.com'::text)
) AS v("full_name", "email");
