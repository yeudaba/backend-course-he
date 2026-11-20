-- נתונים נוספים לבודק האוטומטי (tools/sql.mjs, ‏sameAsSolution): כל קטע "-- @variant" נטען על shop.sql
-- ב־schema נפרד, והשאילתה שלך והפתרון לדוגמה רצות עליו. כך שאילתה שמתאימה רק לנתונים של shop.sql
-- (תשובה מועתקת, WHERE id IN (...), LIMIT במקום תנאי) לא עוברת. לא צריך לטעון את הקובץ הזה בעצמך.

-- @variant  שורות על הגבולות: מחיר 100 בדיוק, תאריכים 1.1 ו־30.6, לא־פעיל יקר, שם כפול, עוד לקוח מחיפה
INSERT INTO products (name, category, price, stock, is_active, added_on) VALUES
  ('Burr Grinder Mini', 'grinders', 100.00, 0, true, '2026-06-30'),
  ('Gold Espresso Machine', 'brewing', 999.00, 0, false, '2026-08-15'),
  ('Kenya Beans 1kg', 'beans', 94.00, 5, true, '2026-01-01'),
  ('Glass Server', 'brewing', 69.00, 9, true, '2026-09-09');
INSERT INTO customers (full_name, email, city, phone, joined_on) VALUES
  ('Eli Mor', 'eli@example.com', 'Haifa', NULL, '2026-06-30'),
  ('Dana Levi', 'dana.levi@example.com', 'Jerusalem', '050-9999999', '2026-01-01'),
  ('Ben Tal', 'ben@EXAMPLE.COM', 'Tel Aviv', NULL, '2026-04-04'),
  ('Rina Sela', 'rina@example.org', 'Jerusalem', '053-1231231', '2026-02-02');

-- @variant  שינויים בשורות קיימות: מחירים, מלאי, פעיל/לא פעיל, עיר וטלפון
UPDATE products SET price = price + 7 WHERE id IN (6, 9, 11);
UPDATE products SET stock = 0 WHERE id IN (3, 13);
UPDATE products SET is_active = false WHERE id = 1;
UPDATE products SET is_active = true, stock = 4 WHERE id = 4;
UPDATE products SET name = 'Grinder Brush Kit' WHERE id = 14;
UPDATE customers SET city = 'Haifa' WHERE id = 1;
UPDATE customers SET city = 'Jerusalem', phone = NULL WHERE id = 3;
UPDATE customers SET phone = '050-1212121', joined_on = '2026-03-06' WHERE id = 6;

-- @variant  פחות שורות: מחיקה (המזהים כבר לא רציפים)
DELETE FROM products WHERE id IN (2, 5, 7);
DELETE FROM customers WHERE id IN (2, 5, 9);
