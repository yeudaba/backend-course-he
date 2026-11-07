CREATE INDEX big_orders_open_created_idx ON big_orders (created_at) WHERE status IN ('paid', 'pending');
