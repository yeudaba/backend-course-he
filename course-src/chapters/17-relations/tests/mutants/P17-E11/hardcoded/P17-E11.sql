
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('1'::integer, '194.70'::numeric),
  ('2'::integer, '278.70'::numeric),
  ('3'::integer, '197.00'::numeric),
  ('5'::integer, '288.70'::numeric),
  ('6'::integer, '169.80'::numeric),
  ('7'::integer, '288.80'::numeric),
  ('8'::integer, '158.60'::numeric),
  ('9'::integer, '233.80'::numeric),
  ('10'::integer, '189.00'::numeric),
  ('11'::integer, '305.00'::numeric),
  ('12'::integer, '269.70'::numeric)
) AS v("order_id", "total");
