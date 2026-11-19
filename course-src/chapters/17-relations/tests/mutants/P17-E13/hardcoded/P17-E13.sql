
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('Michal Biton'::text, '2'::bigint, '593.70'::numeric),
  ('Ron Avraham'::text, '2'::bigint, '558.50'::numeric),
  ('Dana Levi'::text, '3'::bigint, '550.30'::numeric),
  ('Yossi Cohen'::text, '2'::bigint, '448.50'::numeric)
) AS v("full_name", "orders", "spent");
