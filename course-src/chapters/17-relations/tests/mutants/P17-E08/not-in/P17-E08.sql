SELECT full_name, email FROM customers WHERE id NOT IN (SELECT customer_id FROM orders WHERE status <> 'cancelled') ORDER BY full_name;
