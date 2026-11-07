SELECT COALESCE(c.city, 'unknown') AS city, SUM(oi.quantity * oi.unit_price) AS revenue
FROM customers c
JOIN orders o       ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
WHERE o.status <> 'cancelled'
GROUP BY COALESCE(c.city, 'unknown')
ORDER BY revenue DESC;
