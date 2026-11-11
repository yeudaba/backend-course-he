SELECT o.id AS order_id, c.full_name, o.created_at::date AS ordered_on, oi.quantity
FROM order_items oi
JOIN products p  ON p.id = oi.product_id
JOIN orders o    ON o.id = oi.order_id
JOIN customers c ON c.id = o.customer_id
WHERE p.name = 'Ceramic Mug'
ORDER BY o.id;
