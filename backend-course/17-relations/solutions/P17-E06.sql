SELECT o.id AS order_id, c.full_name, o.status
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE c.city = 'Haifa'
ORDER BY o.id;
