UPDATE products
SET price = ROUND(price * 0.8, 2)
WHERE category = 'accessories' AND price < 30
RETURNING name, price;
