SELECT name, category, price
FROM products
WHERE is_active AND category IN ('beans', 'grinders') AND price <= 100
ORDER BY price;
