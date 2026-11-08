-- P27-E23
-- "לקוחות בלי אף הזמנה ששולמה — לשלוח להם קופון". הרשימה שיוצאת שגויה. מצא ותקן (עמודות: id, name — לפי id)
SELECT c.id, c.name
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.status <> 'paid'
ORDER BY c.id;
