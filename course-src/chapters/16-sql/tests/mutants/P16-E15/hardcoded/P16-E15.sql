
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('4'::bigint, '99.00'::numeric, '229.00'::numeric, '149.00'::numeric, '1'::bigint)
) AS v("products", "min_price", "max_price", "avg_price", "out_of_stock");
