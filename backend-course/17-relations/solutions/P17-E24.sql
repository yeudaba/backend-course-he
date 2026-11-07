WITH order_totals AS (
  SELECT o.id, o.customer_id, o.created_at::date AS day, SUM(oi.quantity * oi.unit_price) AS total
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  WHERE o.status <> 'cancelled'
  GROUP BY o.id
)
SELECT c.full_name,
       COUNT(t.id) AS orders,
       COALESCE(SUM(t.total), 0) AS spent,
       MIN(t.day) AS first_order,
       MAX(t.day) AS last_order,
       MAX(t.day) - MIN(t.day) AS days_active,
       CASE COUNT(t.id) WHEN 0 THEN 'new' WHEN 1 THEN 'one-time' ELSE 'repeat' END AS segment
FROM customers c
LEFT JOIN order_totals t ON t.customer_id = c.id
GROUP BY c.id
ORDER BY c.full_name;
