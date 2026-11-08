-- P30-E22
-- "דוח הצמיחה החודשית שלנו לא תואם את הנהלת החשבונות": הכנסות מבוטלות נספרות, הזמנה מחצות ה־1 במאי (שעון ישראל)
-- נספרת באפריל, ואחוזי הצמיחה יוצאים חסרי היגיון. שלוש תקלות. (עמודות: month, revenue, prev_revenue, growth_pct)
WITH monthly AS (
  SELECT to_char(date_trunc('month', created_at AT TIME ZONE 'UTC'), 'YYYY-MM') AS month,
         SUM(total) AS revenue
  FROM orders
  GROUP BY 1
)
SELECT month,
       revenue,
       LAG(revenue) OVER (ORDER BY revenue) AS prev_revenue,
       ROUND((revenue - LAG(revenue) OVER (ORDER BY revenue)) * 100.0 / LAG(revenue) OVER (ORDER BY revenue), 1) AS growth_pct
FROM monthly
ORDER BY month;
