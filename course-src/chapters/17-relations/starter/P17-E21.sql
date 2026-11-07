-- P17-E21: באג. צריך: כל המוצרים עם שם הקטגוריה הנכונה
SELECT p.id, p.name AS product, c.name AS category
FROM products p
JOIN categories c ON c.id = p.id
ORDER BY p.id;
