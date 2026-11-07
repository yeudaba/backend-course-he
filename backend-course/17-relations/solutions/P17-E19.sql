SELECT o.id AS order_id, c.full_name,
       COUNT(*) AS lines,
       SUM(oi.quantity) AS units,
       SUM(oi.quantity * oi.unit_price) AS total
FROM orders o
JOIN customers c    ON c.id = o.customer_id
JOIN order_items oi ON oi.order_id = o.id
WHERE o.status = 'paid'
GROUP BY o.id, c.full_name
ORDER BY total DESC;
