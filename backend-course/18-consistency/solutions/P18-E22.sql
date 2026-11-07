CREATE INDEX big_orders_created_idx ON big_orders (created_at);

SELECT COUNT(*) AS orders, SUM(total) AS revenue
FROM big_orders
WHERE created_at >= '2025-06-01' AND created_at < '2025-06-02';
