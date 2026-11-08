-- P30-E15
-- הכנסה חודשית (רק paid) מול החודש הקודם: LAG מביא את הערך מהשורה הקודמת בחלון
WITH monthly AS (
  SELECT to_char(date_trunc('month', created_at AT TIME ZONE 'Asia/Jerusalem'), 'YYYY-MM') AS month,
         SUM(total) AS revenue
  FROM orders
  WHERE status = 'paid'
  GROUP BY 1
)
SELECT month,
       revenue,
       LAG(revenue) OVER (ORDER BY month) AS prev_revenue,
       ROUND((revenue - LAG(revenue) OVER (ORDER BY month)) * 100.0 / LAG(revenue) OVER (ORDER BY month), 1) AS growth_pct
FROM monthly
ORDER BY month;
