INSERT INTO customers (full_name, email, city, joined_on) VALUES ('Tal Gil', 'tal@example.com', 'Eilat', '2026-05-10') RETURNING id;
INSERT INTO orders (customer_id, status, created_at) VALUES (9, 'pending', '2026-05-10 10:00:00+03') RETURNING id;
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (13, 3, 2, 29.90), (13, 10, 1, 39.00);

SELECT order_id, product_id, quantity, unit_price FROM order_items WHERE order_id = 13 ORDER BY product_id;
