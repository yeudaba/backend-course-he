-- P18-E22: השאילתה נכונה אבל לא משתמשת ב־index. תקן את השאילתה (לא את ה־index)
CREATE INDEX big_orders_created_idx ON big_orders (created_at);

SELECT COUNT(*) AS orders, SUM(total) AS revenue
FROM big_orders
WHERE created_at::date = '2025-06-01';
