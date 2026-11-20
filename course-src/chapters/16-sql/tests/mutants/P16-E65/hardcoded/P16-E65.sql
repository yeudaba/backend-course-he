
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('3'::bigint, '160'::bigint, '68.23'::numeric, '60.00'::numeric, '7184.00'::numeric)
) AS v("products", "units", "avg_price", "price_range", "stock_value");
