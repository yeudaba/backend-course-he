SELECT p.name AS product, c.name AS category, p.price
FROM products p
JOIN categories c ON c.id = p.category_id
WHERE p.is_active
ORDER BY c.name, p.price;
