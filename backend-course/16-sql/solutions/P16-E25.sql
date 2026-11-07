SELECT
  name,
  price,
  ROUND(price * 1.18, 2) AS price_with_vat,
  CASE
    WHEN price < 50 THEN 'basic'
    WHEN price <= 150 THEN 'standard'
    ELSE 'premium'
  END AS tier,
  CASE
    WHEN stock = 0 THEN 'out of stock'
    WHEN stock < 10 THEN 'last units'
    ELSE 'in stock'
  END AS availability
FROM products
WHERE is_active
ORDER BY price, name;
