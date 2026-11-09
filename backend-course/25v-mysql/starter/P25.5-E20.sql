-- P25.5-E20
-- "השאילתה עבדה ב־PostgreSQL": לקוחות מתל אביב (בלי תלות ברישיות) עם ההזמנה האחרונה שלהם.
-- ב־MySQL היא נכשלת או מחזירה שטויות. שלוש תקלות. (עמודות: customer, city, last_total — לפי customer)
SELECT DISTINCT ON (c.id)
       c.name || ' (' || c.email || ')' AS customer,
       c.city,
       o.total AS last_total
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE c.city ILIKE '%aviv%'
ORDER BY c.id, o.created_at DESC;
