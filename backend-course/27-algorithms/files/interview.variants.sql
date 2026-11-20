-- נתונים נוספים לבודק האוטומטי (tools/sql.mjs, ‏sameAsSolution): כל קטע "-- @variant" נטען על interview.sql
-- ב־schema נפרד, והשאילתה שלך והפתרון לדוגמה רצות עליו. לא צריך לטעון את הקובץ הזה בעצמך.

-- @variant  עוד לקוחות והזמנות: מובילה חדשה בתל אביב, עיר חדשה, לקוח בלי הזמנות ולקוח שרק ביטל
INSERT INTO customers (name, email, city) VALUES
  ('Rina Sela', 'rina@example.com', 'Tel Aviv'),
  ('Gal Or', 'gal@example.com', 'Eilat'),
  ('Ben Tal', 'ben@example.com', 'Eilat'),
  ('Lior Katz', 'lior@example.com', 'Haifa');
INSERT INTO orders (customer_id, total, status, created_on) VALUES
  (9, 700.00, 'paid', '2026-10-13'),
  (11, 55.00, 'paid', '2026-10-14'),
  (12, 80.00, 'cancelled', '2026-10-15');
INSERT INTO employees (name, department, salary, manager_id) VALUES ('Rina', 'support', 21000, 8);

-- @variant  שינויים בשורות קיימות: סטטוסים וסכומים
UPDATE orders SET status = 'paid' WHERE id = 7;
UPDATE orders SET status = 'cancelled' WHERE id IN (4, 9);
UPDATE orders SET total = total + 300 WHERE id = 2;
UPDATE employees SET salary = 33000 WHERE id = 3;

-- @variant  פחות שורות: הזמנות ולקוח שנמחקו
DELETE FROM orders WHERE id IN (6, 10);
DELETE FROM customers WHERE id = 8;
