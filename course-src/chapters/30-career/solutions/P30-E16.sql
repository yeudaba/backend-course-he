-- P30-E16
-- cohort: לכל חודש של הזמנה ראשונה — כמה לקוחות חדשים, וכמה מהם הזמינו שוב בחודש שאחריו (רק paid)
WITH paid AS (
  SELECT customer_id, date_trunc('month', created_at AT TIME ZONE 'Asia/Jerusalem') AS m
  FROM orders
  WHERE status = 'paid'
),
first_month AS (
  SELECT customer_id, MIN(m) AS cohort FROM paid GROUP BY customer_id
)
SELECT to_char(f.cohort, 'YYYY-MM') AS cohort,
       COUNT(*) AS customers,
       COUNT(*) FILTER (WHERE EXISTS (
         SELECT 1 FROM paid p WHERE p.customer_id = f.customer_id AND p.m = f.cohort + interval '1 month'
       )) AS returned_next_month
FROM first_month f
GROUP BY f.cohort
ORDER BY f.cohort;
