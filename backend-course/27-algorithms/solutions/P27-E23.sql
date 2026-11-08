-- P27-E23
-- לקוחות בלי אף הזמנה ששולמה — כולל מי שלא הזמין בכלל
SELECT c.id, c.name
FROM customers c
WHERE NOT EXISTS (
  SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'paid'
)
ORDER BY c.id;
