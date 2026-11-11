SELECT
  COUNT(*)                   AS products,
  SUM(stock)                 AS units,
  ROUND(AVG(price), 2)       AS avg_price,
  MAX(price) - MIN(price)    AS price_range,
  SUM(price * stock)         AS stock_value
FROM products
WHERE category = 'beans' AND is_active;
