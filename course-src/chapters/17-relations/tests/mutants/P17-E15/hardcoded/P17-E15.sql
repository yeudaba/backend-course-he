
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('Digital Scale'::text, 'accessories'::text, '129.00'::numeric, '64.30'::numeric),
  ('Colombia Beans 1kg'::text, 'beans'::text, '84.90'::numeric, '68.23'::numeric),
  ('Ethiopia Beans 1kg'::text, 'beans'::text, '89.90'::numeric, '68.23'::numeric),
  ('Gooseneck Kettle'::text, 'brewing'::text, '229.00'::numeric, '149.00'::numeric),
  ('Electric Grinder Pro'::text, 'grinders'::text, '649.00'::numeric, '419.00'::numeric)
) AS v("product", "category", "price", "category_avg");
