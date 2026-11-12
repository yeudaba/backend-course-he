-- P25.5-E49: סכום מצטבר לכל לקוח
SELECT c.name AS customer, o.id AS order_id, o.created_at, o.total,
       SUM(o.total) OVER w AS running_total,
       ROW_NUMBER() OVER w AS nth
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE o.status IN ('paid', 'shipped')
WINDOW w AS (PARTITION BY o.customer_id ORDER BY o.created_at, o.id)
ORDER BY c.name, o.created_at, o.id;
