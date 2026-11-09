-- P25.5-E20
-- "השאילתה עבדה ב־PostgreSQL": שלוש בעיות ב־MySQL
-- תקלה 1: || ב־MySQL הוא OR לוגי (מחזיר 0/1), לא חיבור מחרוזות ← CONCAT
-- תקלה 2: אין ILIKE ← LIKE, שבקולציה של הטבלה (_ai_ci) כבר לא רגיש לרישיות
-- תקלה 3: DISTINCT ON לא קיים ← ROW_NUMBER() בתת־שאילתה
SELECT customer, city, last_total
FROM (
  SELECT CONCAT(c.name, ' (', c.email, ')') AS customer,
         c.city,
         o.total AS last_total,
         ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY o.created_at DESC) AS rn
  FROM customers c
  JOIN orders o ON o.customer_id = c.id
  WHERE c.city LIKE '%aviv%'
) t
WHERE rn = 1
ORDER BY customer;
