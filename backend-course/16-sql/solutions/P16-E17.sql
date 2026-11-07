UPDATE products SET is_active = false WHERE stock = 0;
UPDATE products SET price = ROUND(price * 1.05, 2) WHERE category = 'beans' AND is_active;
SELECT name, price, is_active FROM products WHERE category = 'beans' ORDER BY id;
