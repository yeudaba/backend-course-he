CREATE INDEX big_orders_created_at_idx ON big_orders (created_at);

SELECT created_at::date AS day, COUNT(*) AS orders, SUM(total) AS revenue
FROM big_orders
WHERE created_at >= '2025-06-01' AND created_at < '2025-06-08' AND status <> 'cancelled'
GROUP BY 1
ORDER BY 1;
