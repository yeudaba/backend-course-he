-- P16-E22: באג. צריך: 20% הנחה רק על accessories שמחירם מתחת ל־30
UPDATE products
SET price = ROUND(price * 0.8, 2)
WHERE category = 'accessories' OR price < 30
RETURNING name, price;
