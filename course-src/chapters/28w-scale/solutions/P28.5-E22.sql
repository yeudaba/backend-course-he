-- P28.5-E22: לקוחות פעילים והכנסה לכל יום (בשעון ישראל) — אחרי התיקון
SELECT
  strftime(timezone('Asia/Jerusalem', created_at), '%Y-%m-%d') AS day, -- תיקון 1: יום בישראל, לא UTC
  count(DISTINCT customer_id) AS active_customers,                      -- תיקון 2: לקוחות שונים, לא הזמנות
  round(sum(quantity * price_cents) / 100.0, 2) AS revenue               -- תיקון 3: כמות × מחיר
FROM orders
WHERE country = 'IL'
GROUP BY day
ORDER BY day
LIMIT 10;
