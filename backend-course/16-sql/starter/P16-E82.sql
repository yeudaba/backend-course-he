-- P16-E82: full_name ו־phone של כל הלקוחות מחיפה (Haifa), לפי id.
-- יש כאן שלוש תקלות. תקן אחת בכל פעם, לפי ההודעה של PostgreSQL.
--
-- בדיקה:  npm run check P16-E82
SELECT fullname, phone
FROM customer
WHERE city = Haifa
ORDER BY id;
