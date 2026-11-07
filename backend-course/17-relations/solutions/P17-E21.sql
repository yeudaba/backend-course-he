SELECT p.id, p.name AS product, c.name AS category
FROM products p
JOIN categories c ON c.id = p.category_id
ORDER BY p.id;
