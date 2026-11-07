SELECT COUNT(*) AS products, SUM(price * stock) AS stock_value
FROM products
WHERE is_active;
