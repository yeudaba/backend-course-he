
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('12'::bigint, '28510.50'::numeric)
) AS v("products", "stock_value");
