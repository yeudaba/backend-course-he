WITH spent AS (
  SELECT customer_id, COUNT(*) AS orders, SUM(total) AS spent, MAX(created_at) AS last_at
  FROM orders
  WHERE status IN ('paid', 'shipped')
  GROUP BY customer_id
),
cart AS (
  SELECT customer_id, SUM(quantity) AS units
  FROM cart_items
  GROUP BY customer_id
)
SELECT
  c.name,
  c.city,
  IFNULL(s.orders, 0) AS orders,
  IFNULL(s.spent, 0) AS spent,
  DATE_FORMAT(s.last_at, '%d/%m/%Y') AS last_order,
  IFNULL(ct.units, 0) AS cart_units,
  RANK() OVER (PARTITION BY c.city ORDER BY IFNULL(s.spent, 0) DESC) AS city_rank
FROM customers c
LEFT JOIN spent s ON s.customer_id = c.id
LEFT JOIN cart ct ON ct.customer_id = c.id
ORDER BY c.city, city_rank, c.name;
