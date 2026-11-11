WITH order_totals AS (
  SELECT o.id, o.customer_id, SUM(oi.quantity * oi.unit_price) AS total
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  WHERE o.status <> 'cancelled'
  GROUP BY o.id
)
SELECT COALESCE(c.city, 'unknown') AS city, COUNT(*) AS orders, ROUND(AVG(t.total), 2) AS avg_order
FROM order_totals t
JOIN customers c ON c.id = t.customer_id
GROUP BY 1
ORDER BY avg_order DESC, city;
