SELECT full_name, email
FROM customers
WHERE id IN (SELECT customer_id FROM orders WHERE status = 'pending')
ORDER BY full_name;
