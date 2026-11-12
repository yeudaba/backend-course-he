CREATE INDEX big_orders_customer_status_created_idx ON big_orders (customer_id, status, created_at);
EXPLAIN (COSTS OFF)
SELECT id, total, created_at FROM big_orders
WHERE customer_id = 42 AND status = 'paid'
ORDER BY created_at DESC LIMIT 5;
