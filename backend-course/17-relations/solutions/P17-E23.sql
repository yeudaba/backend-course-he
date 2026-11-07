SELECT cat.name AS category, SUM(oi.quantity * oi.unit_price) AS revenue
FROM order_items oi
JOIN orders o       ON o.id = oi.order_id
JOIN products p     ON p.id = oi.product_id
JOIN categories cat ON cat.id = p.category_id
WHERE o.status <> 'cancelled'
GROUP BY cat.name
HAVING SUM(oi.quantity * oi.unit_price) > 400
ORDER BY revenue DESC;
