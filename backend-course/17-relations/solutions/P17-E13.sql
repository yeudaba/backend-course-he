SELECT c.full_name, COUNT(DISTINCT o.id) AS orders, SUM(oi.quantity * oi.unit_price) AS spent
FROM customers c
JOIN orders o       ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
WHERE o.status <> 'cancelled'
GROUP BY c.id
HAVING SUM(oi.quantity * oi.unit_price) > 300
ORDER BY spent DESC;
