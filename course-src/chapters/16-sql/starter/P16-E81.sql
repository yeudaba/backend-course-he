-- P16-E81: name ו־price של כל המוצרים בקטגוריה brewing, לפי id.
-- יש כאן שלוש תקלות. תקן אחת בכל פעם, לפי ההודעה של PostgreSQL.
--
-- בדיקה:  npm run check P16-E81
SELECT name, price
FROM product
WHERE category = "Brewing"
ORDER BY id;
