SELECT id, customer_id, status
FROM orders
WHERE created_at = (SELECT MAX(created_at) FROM orders)
ORDER BY id;
