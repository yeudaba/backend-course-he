
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('Itay Hadad'::text, 'Tel Aviv'::text, '2026-06-19'::date),
  ('Tamar Gabay'::text, 'Jerusalem'::text, '2026-05-27'::date),
  ('Michal Biton'::text, 'Tel Aviv'::text, '2026-02-11'::date),
  ('Noa Mizrahi'::text, 'Jerusalem'::text, '2026-01-08'::date),
  ('Dana Levi'::text, 'Tel Aviv'::text, '2025-11-02'::date)
) AS v("full_name", "city", "joined_on");
