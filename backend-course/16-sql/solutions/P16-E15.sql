SELECT
  COUNT(*) AS products,
  MIN(price) AS min_price,
  MAX(price) AS max_price,
  ROUND(AVG(price), 2) AS avg_price,
  COUNT(*) FILTER (WHERE stock = 0) AS out_of_stock
FROM products
WHERE category = 'brewing';
