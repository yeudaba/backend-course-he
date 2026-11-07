SELECT c.name AS category, COUNT(p.id) AS products
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
GROUP BY c.id
ORDER BY c.name;
