SELECT c.full_name
FROM customers c
WHERE EXISTS (
  SELECT 1
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  JOIN products p     ON p.id = oi.product_id
  JOIN categories cat ON cat.id = p.category_id
  WHERE o.customer_id = c.id AND o.status <> 'cancelled' AND cat.name = 'grinders'
)
ORDER BY c.full_name;
