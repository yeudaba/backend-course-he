-- P27-E43: כפילויות ב־SQL, לא בשרת
SELECT lower(trim(email)) AS email,
       COUNT(*) AS copies,
       array_agg(id ORDER BY id) AS ids
FROM customers
GROUP BY lower(trim(email))
HAVING COUNT(*) > 1
ORDER BY email;
