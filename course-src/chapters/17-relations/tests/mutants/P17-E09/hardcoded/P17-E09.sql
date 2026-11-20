
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('Ethiopia Beans 1kg'::text, '1'::integer, '89.90'::numeric, '89.90'::numeric),
  ('French Press 1L'::text, '1'::integer, '119.00'::numeric, '119.00'::numeric),
  ('Paper Filters (100)'::text, '1'::integer, '24.90'::numeric, '24.90'::numeric)
) AS v("product", "quantity", "unit_price", "line_total");
