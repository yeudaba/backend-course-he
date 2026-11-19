-- נתונים נוספים לבודק האוטומטי (tools/sql.mjs, ‏sameAsSolution): כל קטע "-- @variant" נטען על store.sql
-- ב־schema נפרד, והשאילתה שלך והפתרון לדוגמה רצות עליו. כך שאילתה שמתאימה רק לנתונים של store.sql
-- (תשובה מועתקת, WHERE id IN (...), GROUP BY לפי שם) לא עוברת. לא צריך לטעון את הקובץ הזה בעצמך.

-- @variant  עוד לקוחות (שם כפול, לקוח שכל ההזמנות שלו בוטלו, לקוח בלי הזמנות), עוד הזמנות, מוצר שלא נמכר וקטגוריה ריקה
INSERT INTO categories (name) VALUES ('syrups');
INSERT INTO products (name, category_id, price, stock, is_active) VALUES ('Tea Kettle', 3, 97.00, 4, true);
INSERT INTO customers (full_name, email, city, joined_on) VALUES
  ('Dana Levi', 'dana2@example.com', 'Haifa', '2026-05-05'),
  ('Tal Ron', 'tal@example.com', NULL, '2026-06-06'),
  ('Zeev Kaplan', 'zeev@example.com', 'Eilat', '2026-06-07');
INSERT INTO orders (customer_id, status, created_at) VALUES
  (9, 'paid', '2026-05-10 10:00:00+03'),
  (10, 'cancelled', '2026-05-11 12:00:00+03'),
  (9, 'shipped', '2026-06-01 09:30:00+03'),
  (2, 'paid', '2026-06-02 17:45:00+03');
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
  (13, 4, 1, 189.00), (13, 10, 2, 39.00),
  (14, 5, 1, 649.00),
  (15, 1, 1, 89.90), (15, 6, 1, 119.00), (15, 9, 3, 24.90),
  (16, 9, 5, 24.90), (16, 3, 1, 29.90);

-- @variant  שינויים בשורות קיימות: סטטוסים, כמויות, מחירים, עיר ותאריכים
UPDATE orders SET status = 'paid' WHERE id = 12;
UPDATE orders SET status = 'cancelled' WHERE id = 5;
UPDATE orders SET created_at = created_at + interval '20 days' WHERE id IN (3, 11);
UPDATE order_items SET quantity = quantity + 1 WHERE order_id IN (2, 9);
UPDATE products SET price = price + 5 WHERE id IN (4, 7);
UPDATE products SET is_active = false WHERE id = 10;
UPDATE customers SET city = 'Haifa' WHERE id = 5;

-- @variant  פחות שורות: הזמנות שנמחקו ומוצר שנמחק (המזהים כבר לא רציפים)
DELETE FROM orders WHERE id IN (7, 10);
DELETE FROM products WHERE id = 11;
