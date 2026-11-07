CREATE INDEX big_orders_customer_created_idx ON big_orders (customer_id, created_at);
CREATE INDEX big_orders_status_created_idx ON big_orders (status, created_at);
