WITH averages AS (
  SELECT category_id, AVG(price) AS avg_price
  FROM products
  GROUP BY category_id
)
SELECT p.name AS product, c.name AS category, p.price, ROUND(a.avg_price, 2) AS category_avg
FROM products p
JOIN averages a   ON a.category_id = p.category_id
JOIN categories c ON c.id = p.category_id
WHERE p.price > a.avg_price
ORDER BY c.name, p.price;
