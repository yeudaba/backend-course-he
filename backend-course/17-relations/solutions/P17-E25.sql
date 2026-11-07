SELECT pa.name AS product_a, pb.name AS product_b, COUNT(*) AS orders_together
FROM order_items a
JOIN order_items b ON b.order_id = a.order_id AND a.product_id < b.product_id
JOIN orders o      ON o.id = a.order_id
JOIN products pa   ON pa.id = a.product_id
JOIN products pb   ON pb.id = b.product_id
WHERE o.status <> 'cancelled'
GROUP BY pa.name, pb.name
HAVING COUNT(*) >= 2
ORDER BY orders_together DESC, product_a, product_b;
