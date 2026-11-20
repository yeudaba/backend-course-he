-- נתונים נוספים לבודק האוטומטי (tools/mysql.mjs, ‏sameAsSolution): כל קטע "-- @variant" נטען על shop.sql
-- ב־database נפרד, והשאילתה שלך והפתרון לדוגמה רצות עליו. כך שאילתה שמתאימה רק לנתונים של shop.sql
-- (תשובה מועתקת, WHERE id IN (...)) לא עוברת. לא צריך לטעון את הקובץ הזה בעצמך.

-- @variant  עוד מוצרים, לקוחות (שם כפול, עוד לקוחה מתל אביב) והזמנות
INSERT INTO products (name, category, price, stock, is_active, attributes) VALUES
  ('Kenya Beans 1kg', 'beans', 94.00, 5, TRUE, '{"origin": "Kenya", "roast": "light", "weight_g": 1000}'),
  ('Burr Grinder Mini', 'grinders', 100.00, 6, TRUE, '{"burr": "steel", "settings": 12}'),
  ('Glass Server', 'brewing', 69.00, 9, TRUE, '{"material": "glass", "cups": 4}'),
  ('Pour Kettle', 'brewing', 259.00, 0, TRUE, '{"material": "steel"}');
INSERT INTO customers (name, email, city, created_at) VALUES
  ('Rina Sela', 'rina@example.com', 'Tel Aviv', '2026-03-10 09:00:00'),
  ('Dana Levi', 'dana2@example.com', 'Jerusalem', '2026-03-11 09:00:00');
INSERT INTO orders (customer_id, status, total, created_at) VALUES
  (6, 'paid', 194.00, '2026-03-12 10:00:00'),
  (6, 'shipped', 100.00, '2026-03-13 11:00:00'),
  (7, 'paid', 69.00, '2026-03-14 12:00:00');
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
  (7, 12, 1, 94.00), (7, 4, 1, 100.00),
  (8, 13, 1, 100.00),
  (9, 14, 1, 69.00);
INSERT INTO cart_items (customer_id, product_id, quantity) VALUES (6, 1, 3), (7, 5, 1);

-- @variant  שינויים בשורות קיימות: מחירים, מלאי, סטטוס, תאריך ועיר
UPDATE products SET price = price + 5 WHERE id IN (4, 8);
UPDATE products SET stock = 0 WHERE id = 1;
UPDATE products SET is_active = FALSE WHERE id = 6;
UPDATE orders SET status = 'paid' WHERE id = 6;
UPDATE orders SET created_at = '2026-03-08 09:00:00' WHERE id = 5;
UPDATE customers SET city = 'Tel Aviv' WHERE id = 5;

-- @variant  פחות שורות: הזמנה ומוצר שנמחקו
DELETE FROM orders WHERE id = 4;
DELETE FROM cart_items WHERE customer_id = 5;
DELETE FROM products WHERE id = 10;
