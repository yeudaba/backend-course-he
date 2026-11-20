WITH ranked AS (
  SELECT id, customer_id, created_at,
         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC, id DESC) AS rn
  FROM orders
  WHERE status <> 'cancelled'
)
SELECT id, customer_id, created_at
FROM ranked
WHERE rn = 1
ORDER BY customer_id;
