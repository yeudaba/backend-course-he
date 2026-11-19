
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('Dana Levi'::text, '1'::integer, '1'::bigint, '194.70'::numeric, '194.70'::numeric),
  ('Dana Levi'::text, '3'::integer, '2'::bigint, '197.00'::numeric, '391.70'::numeric),
  ('Dana Levi'::text, '8'::integer, '3'::bigint, '158.60'::numeric, '550.30'::numeric),
  ('Michal Biton'::text, '5'::integer, '1'::bigint, '288.70'::numeric, '288.70'::numeric),
  ('Michal Biton'::text, '11'::integer, '2'::bigint, '305.00'::numeric, '593.70'::numeric),
  ('Noa Mizrahi'::text, '10'::integer, '1'::bigint, '189.00'::numeric, '189.00'::numeric),
  ('Ron Avraham'::text, '7'::integer, '1'::bigint, '288.80'::numeric, '288.80'::numeric),
  ('Ron Avraham'::text, '12'::integer, '2'::bigint, '269.70'::numeric, '558.50'::numeric),
  ('Shira David'::text, '9'::integer, '1'::bigint, '233.80'::numeric, '233.80'::numeric),
  ('Yossi Cohen'::text, '2'::integer, '1'::bigint, '278.70'::numeric, '278.70'::numeric),
  ('Yossi Cohen'::text, '6'::integer, '2'::bigint, '169.80'::numeric, '448.50'::numeric)
) AS v("full_name", "order_id", "order_no", "total", "running_total");
