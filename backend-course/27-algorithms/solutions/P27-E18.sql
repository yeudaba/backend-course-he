-- P27-E18
-- הלקוח המוביל בכל עיר (סכום ההזמנות ששולמו); בתיקו — ה־id הקטן. ROW_NUMBER ממספר בתוך כל עיר
WITH totals AS (
  SELECT c.id, c.name, c.city, SUM(o.total) AS paid_total
  FROM customers c
  JOIN orders o ON o.customer_id = c.id AND o.status = 'paid'
  GROUP BY c.id
),
ranked AS (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY city ORDER BY paid_total DESC, id) AS rn
  FROM totals
)
SELECT city, name, paid_total
FROM ranked
WHERE rn = 1
ORDER BY city;
