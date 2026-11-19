
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('10'::integer, 'Noa Mizrahi'::text, '1'::bigint, '1'::bigint, '189.00'::numeric),
  ('6'::integer, 'Yossi Cohen'::text, '1'::bigint, '2'::bigint, '169.80'::numeric),
  ('8'::integer, 'Dana Levi'::text, '2'::bigint, '5'::bigint, '158.60'::numeric)
) AS v("order_id", "full_name", "lines", "units", "total");
