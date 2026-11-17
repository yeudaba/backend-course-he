-- P25.5-E41: הכנסות לפי חודש
SELECT DATE_FORMAT(created_at, '%Y-%m') AS month,
       COUNT(*) AS orders,
       SUM(total) AS revenue,
       ROUND(AVG(total), 2) AS avg_order
FROM orders
WHERE status IN ('paid', 'shipped')
GROUP BY month
ORDER BY month;
