-- P25.5-E55: מעגלה להזמנה — ב־SQL אחד
START TRANSACTION;
INSERT INTO orders (customer_id, status, total)
  SELECT 1, 'pending_payment', SUM(ci.quantity * p.price)
  FROM cart_items ci JOIN products p ON p.id = ci.product_id
  WHERE ci.customer_id = 1;
SET @order_id = LAST_INSERT_ID();
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
  SELECT @order_id, ci.product_id, ci.quantity, p.price
  FROM cart_items ci JOIN products p ON p.id = ci.product_id
  WHERE ci.customer_id = 1;
DELETE FROM cart_items WHERE customer_id = 1;
COMMIT;
SELECT o.id, o.customer_id, o.status, o.total,
       COUNT(*) AS line_count, SUM(oi.quantity) AS units,
       (SELECT COUNT(*) FROM cart_items WHERE customer_id = 1) AS cart_left
FROM orders o JOIN order_items oi ON oi.order_id = o.id
WHERE o.id = @order_id
GROUP BY o.id;
