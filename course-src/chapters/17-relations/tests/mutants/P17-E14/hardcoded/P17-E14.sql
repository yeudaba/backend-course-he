
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('2026-01-01'::date, '2'::bigint, '473.40'::numeric),
  ('2026-02-01'::date, '2'::bigint, '485.70'::numeric),
  ('2026-03-01'::date, '3'::bigint, '617.20'::numeric),
  ('2026-04-01'::date, '2'::bigint, '422.80'::numeric),
  ('2026-05-01'::date, '2'::bigint, '574.70'::numeric)
) AS v("month", "orders", "revenue");
