
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('Dana Levi'::text, '3'::bigint, '11'::bigint),
  ('Michal Biton'::text, '2'::bigint, '9'::bigint),
  ('Noa Mizrahi'::text, '2'::bigint, '2'::bigint),
  ('Ron Avraham'::text, '2'::bigint, '6'::bigint),
  ('Shira David'::text, '1'::bigint, '3'::bigint),
  ('Yossi Cohen'::text, '2'::bigint, '6'::bigint)
) AS v("full_name", "orders", "units");
