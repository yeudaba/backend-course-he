WITH revenue AS (
  SELECT cat.name AS category, p.name AS product, SUM(oi.quantity * oi.unit_price) AS revenue
  FROM order_items oi
  JOIN orders o       ON o.id = oi.order_id
  JOIN products p     ON p.id = oi.product_id
  JOIN categories cat ON cat.id = p.category_id
  WHERE o.status <> 'cancelled'
  GROUP BY cat.name, p.name
),
ranked AS (
  SELECT category, product, revenue,
         ROW_NUMBER() OVER (PARTITION BY category ORDER BY revenue DESC, product) AS "rank"
  FROM revenue
)
SELECT category, product, revenue, "rank"
FROM ranked
WHERE "rank" <= 2
ORDER BY category, "rank";
