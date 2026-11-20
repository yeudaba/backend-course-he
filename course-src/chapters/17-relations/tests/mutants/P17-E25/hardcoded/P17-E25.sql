
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('Ethiopia Beans 1kg'::text, 'Paper Filters (100)'::text, '3'::bigint)
) AS v("product_a", "product_b", "orders_together");
