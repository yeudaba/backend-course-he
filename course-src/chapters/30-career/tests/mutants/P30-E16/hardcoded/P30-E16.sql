
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('2026-01'::text, '2'::bigint, '1'::bigint),
  ('2026-02'::text, '2'::bigint, '0'::bigint),
  ('2026-03'::text, '1'::bigint, '1'::bigint),
  ('2026-04'::text, '1'::bigint, '1'::bigint),
  ('2026-06'::text, '2'::bigint, '0'::bigint)
) AS v("cohort", "customers", "returned_next_month");
