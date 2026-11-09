-- P25.5-E18
-- השאילתה: WHERE customer_id = ? AND status = 'paid' ORDER BY created_at DESC LIMIT 10.
-- אינדקס מורכב בסדר: שוויון קודם (customer_id, status), ואז המיון (created_at) — בלי filesort, ובלי לסרוק הזמנות בסטטוס אחר
CREATE INDEX idx_orders_customer_status_created ON orders (customer_id, status, created_at);
