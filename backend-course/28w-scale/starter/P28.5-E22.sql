-- P28.5-E22: לקוחות פעילים והכנסה לכל יום (בשעון ישראל), הזמנות מישראל — שלוש תקלות
SELECT
  created_at::DATE::VARCHAR AS day,
  count(customer_id) AS active_customers,
  round(sum(price_cents) / 100.0, 2) AS revenue
FROM orders
WHERE country = 'IL'
GROUP BY day
ORDER BY day
LIMIT 10;
