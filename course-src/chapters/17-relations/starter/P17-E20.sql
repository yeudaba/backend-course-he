-- P17-E20: באג. צריך: כל 8 הלקוחות, עם מספר ההזמנות ששולמו (0 למי שאין)
SELECT c.full_name, COUNT(*) AS paid_orders
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.status = 'paid'
GROUP BY c.id
ORDER BY c.full_name;
