-- P28.5-E75: מדינות — הזמנות, לקוחות, ממוצע ודירוג
SELECT
  country,
  count(*) AS orders,
  count(DISTINCT customer_id) AS customers,
  round(avg(quantity * price_cents) / 100.0, 2) AS avg_order,
  rank() OVER (ORDER BY sum(quantity * price_cents) DESC) AS rank
FROM orders
GROUP BY country
ORDER BY rank;
