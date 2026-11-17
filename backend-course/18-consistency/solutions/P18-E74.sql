CREATE INDEX big_orders_created_id_idx ON big_orders (created_at, id);

SELECT id, created_at, total
FROM big_orders
WHERE (created_at, id) < ('2025-06-01 12:00:00+00', 100000)
ORDER BY created_at DESC, id DESC
LIMIT 10;
