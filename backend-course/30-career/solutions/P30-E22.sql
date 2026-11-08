-- P30-E22
-- תקלה 1: לא היה WHERE status = 'paid' ← הזמנות מבוטלות נספרו כהכנסה
-- תקלה 2: AT TIME ZONE 'UTC' ← "חודש" של הנהלת חשבונות ישראלית הוא לפי שעון ישראל (פרק 24)
-- תקלה 3: LAG ... ORDER BY revenue ← "החודש הקודם" היה החודש עם ההכנסה הקטנה הבאה, לא החודש הקודם בזמן
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
