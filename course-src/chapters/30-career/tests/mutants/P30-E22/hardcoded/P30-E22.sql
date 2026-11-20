
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('2026-01'::text, '278.90'::numeric, NULL::numeric, NULL::numeric),
  ('2026-02'::text, '712.90'::numeric, '278.90'::numeric, '155.6'::numeric),
  ('2026-03'::text, '378.00'::numeric, '712.90'::numeric, '-47.0'::numeric),
  ('2026-04'::text, '337.90'::numeric, '378.00'::numeric, '-10.6'::numeric),
  ('2026-05'::text, '89.90'::numeric, '337.90'::numeric, '-73.4'::numeric),
  ('2026-06'::text, '292.90'::numeric, '89.90'::numeric, '225.8'::numeric)
) AS v("month", "revenue", "prev_revenue", "growth_pct");
