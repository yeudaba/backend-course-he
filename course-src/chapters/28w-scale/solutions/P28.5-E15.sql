-- P28.5-E15: דוח קטגוריות על 60,000 הזמנות (orders = files/orders.parquet)
SELECT
  category,
  count(*) AS orders,
  sum(quantity) AS units,
  round(sum(quantity * price_cents) / 100.0, 2) AS revenue,
  round(100.0 * sum(quantity * price_cents) / sum(sum(quantity * price_cents)) OVER (), 1) AS share_pct
FROM orders
GROUP BY category
ORDER BY revenue DESC;
