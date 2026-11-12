CREATE INDEX big_orders_total_idx ON big_orders (total);
EXPLAIN (COSTS OFF) SELECT id, customer_id FROM big_orders WHERE total = 123.45;
