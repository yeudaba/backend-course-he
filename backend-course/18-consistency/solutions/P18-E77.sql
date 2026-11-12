SELECT p.id, p.full_name, COUNT(o.id) AS orders, MAX(o.created_at) AS last_order
FROM people p
LEFT JOIN big_orders o ON o.customer_id = p.id
WHERE p.id BETWEEN 1 AND 10
GROUP BY p.id
ORDER BY p.id;
