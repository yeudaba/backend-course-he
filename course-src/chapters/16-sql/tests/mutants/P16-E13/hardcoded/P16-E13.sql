
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('Noa Mizrahi'::text, 'noa@example.com'::text, '2026-01-08'::date),
  ('Avi Peretz'::text, 'avi@example.com'::text, '2026-01-20'::date),
  ('Michal Biton'::text, 'michal@example.com'::text, '2026-02-11'::date),
  ('Ron Avraham'::text, 'ron@example.com'::text, '2026-03-05'::date),
  ('Shira David'::text, 'shira@example.com'::text, '2026-03-30'::date),
  ('Omer Shalom'::text, 'omer@example.com'::text, '2026-04-12'::date),
  ('Tamar Gabay'::text, 'tamar@example.com'::text, '2026-05-27'::date),
  ('Itay Hadad'::text, 'itay@Example.com'::text, '2026-06-19'::date)
) AS v("full_name", "email", "joined_on");
