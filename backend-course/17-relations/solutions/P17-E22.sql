SELECT c.full_name, COUNT(DISTINCT o.id) AS orders, SUM(oi.quantity) AS units
FROM customers c
JOIN orders o       ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
GROUP BY c.id
ORDER BY c.full_name;
