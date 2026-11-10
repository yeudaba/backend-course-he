WITH order_totals AS (
  SELECT o.id, o.customer_id, o.created_at, SUM(oi.quantity * oi.unit_price) AS total
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  WHERE o.status <> 'cancelled'
  GROUP BY o.id
)
SELECT
  c.full_name,
  t.id AS order_id,
  ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY t.created_at) AS order_no,
  t.total,
  SUM(t.total) OVER (PARTITION BY c.id ORDER BY t.created_at) AS running_total
FROM order_totals t
JOIN customers c ON c.id = t.customer_id
ORDER BY c.full_name, order_no;
