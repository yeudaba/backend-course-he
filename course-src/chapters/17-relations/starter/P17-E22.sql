-- P17-E22: באג. צריך: לכל לקוח — מספר ההזמנות ומספר היחידות
SELECT c.full_name, COUNT(*) AS orders, SUM(oi.quantity) AS units
FROM customers c
JOIN orders o       ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
GROUP BY c.id
ORDER BY c.full_name;
