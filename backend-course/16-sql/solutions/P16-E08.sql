SELECT id, name
FROM products
WHERE is_active AND stock = 0
ORDER BY id;
