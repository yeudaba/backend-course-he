CREATE INDEX big_orders_customer_created_idx ON big_orders (created_at, customer_id);
CREATE INDEX big_orders_status_created_idx ON big_orders (status, created_at);
