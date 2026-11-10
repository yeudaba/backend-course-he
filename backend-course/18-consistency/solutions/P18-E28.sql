WITH monthly AS (
  SELECT date_trunc('month', created_at)::date AS month, customer_id, SUM(total) AS revenue
  FROM big_orders
  WHERE status IN ('paid', 'shipped')
    AND created_at >= '2025-01-01' AND created_at < '2025-04-01'
  GROUP BY 1, 2
),
ranked AS (
  SELECT month, customer_id, revenue,
         ROW_NUMBER() OVER (PARTITION BY month ORDER BY revenue DESC, customer_id) AS place
  FROM monthly
)
SELECT month, place, customer_id, revenue
FROM ranked
WHERE place <= 3
ORDER BY month, place;
