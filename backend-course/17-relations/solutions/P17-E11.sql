SELECT o.id AS order_id, SUM(oi.quantity * oi.unit_price) AS total
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE o.status <> 'cancelled'
GROUP BY o.id
ORDER BY o.id;
