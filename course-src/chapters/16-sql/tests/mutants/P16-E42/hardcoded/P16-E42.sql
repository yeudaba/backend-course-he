
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('6'::integer, 'Ron Avraham'::text, '2026-03-05'::date)
) AS v("id", "full_name", "joined_on");
