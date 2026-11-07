SELECT p.name AS product, oi.quantity, oi.unit_price, oi.quantity * oi.unit_price AS line_total
FROM order_items oi
JOIN products p ON p.id = oi.product_id
WHERE oi.order_id = 9
ORDER BY p.name;
