-- P28.5-E76: הכנסה יומית ומצטברת
WITH daily AS (
  SELECT created_at::DATE AS day, sum(quantity * price_cents) AS cents
  FROM orders
  GROUP BY 1
)
SELECT
  day,
  round(cents / 100.0, 2) AS revenue,
  round(sum(cents) OVER (ORDER BY day) / 100.0, 2) AS running,
  round(100.0 * (cents - lag(cents) OVER (ORDER BY day)) / lag(cents) OVER (ORDER BY day), 1) AS vs_prev_pct
FROM daily
ORDER BY day;
