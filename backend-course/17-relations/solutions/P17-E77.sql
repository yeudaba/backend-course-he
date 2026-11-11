SELECT cat.name AS category, p.name AS product, p.price,
       RANK() OVER (PARTITION BY cat.name ORDER BY p.price DESC) AS price_rank
FROM products p
JOIN categories cat ON cat.id = p.category_id
WHERE p.is_active
ORDER BY category, price_rank, product;
