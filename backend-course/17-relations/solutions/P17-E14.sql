SELECT date_trunc('month', o.created_at)::date AS month,
       COUNT(DISTINCT o.id) AS orders,
       SUM(oi.quantity * oi.unit_price) AS revenue
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE o.status <> 'cancelled'
GROUP BY 1
ORDER BY 1;
