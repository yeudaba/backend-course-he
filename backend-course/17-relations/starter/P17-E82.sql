-- P17-E82: ההזמנה האחרונה (שלא בוטלה) של כל לקוח: id, customer_id, created_at — לפי customer_id.
-- בתיקו בזמן — ה־id הגבוה. יש כאן שלוש תקלות.
--
-- בדיקה:  npm run check P17-E82
WITH ranked AS (
  SELECT id, customer_id, status, created_at,
         ROW_NUMBER() OVER (ORDER BY created_at) AS rn
  FROM orders
)
SELECT id, customer_id, created_at
FROM ranked
WHERE rn = 1 AND status <> 'cancelled'
ORDER BY customer_id;
