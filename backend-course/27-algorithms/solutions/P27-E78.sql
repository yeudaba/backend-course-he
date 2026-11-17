-- P27-E78: סכום מצטבר לכל לקוח — window function
SELECT customer_id, id, created_on, total,
       SUM(total) OVER (PARTITION BY customer_id ORDER BY created_on, id) AS running_total
FROM orders
WHERE status = 'paid'
ORDER BY customer_id, created_on, id;
