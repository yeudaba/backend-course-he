-- P30-E91
-- הלקוח המוביל בכל עיר, וחלקו בהכנסה של העיר
WITH per_customer AS (
  SELECT c.id, c.name, c.city, SUM(o.total) AS revenue
  FROM customers c
  JOIN orders o ON o.customer_id = c.id
  WHERE o.status = 'paid'
  GROUP BY c.id, c.name, c.city
),
ranked AS (
  SELECT *,
         ROW_NUMBER() OVER (PARTITION BY city ORDER BY revenue DESC, id) AS rn,
         SUM(revenue) OVER (PARTITION BY city) AS city_revenue
  FROM per_customer
)
SELECT city, name, revenue, ROUND(revenue * 100.0 / city_revenue, 1) AS share_pct
FROM ranked
WHERE TRUE OR rn = 1
ORDER BY city;
