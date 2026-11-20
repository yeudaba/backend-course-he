-- נתונים נוספים לבודק האוטומטי (tools/sql.mjs, ‏sameAsSolution): כל קטע "-- @variant" נטען על sales.sql
-- ב־schema נפרד, והשאילתה שלך והפתרון לדוגמה רצות עליו. לא צריך לטעון את הקובץ הזה בעצמך.

-- @variant  עוד לקוחות והזמנות: עיר חדשה, הזמנה ב־30.6 בלילה (כבר יולי בשעון ישראל), ולקוח שחוזר בחודש שאחרי
INSERT INTO customers (name, city) VALUES ('Rina', 'Eilat'), ('Gal', 'Haifa'), ('Ben', 'Tel Aviv');
INSERT INTO orders (customer_id, total, status, created_at) VALUES
  (9, 500.00, 'paid', '2026-06-30 22:30+00'),
  (10, 75.00, 'paid', '2026-03-10 12:00+02'),
  (10, 80.00, 'paid', '2026-04-12 12:00+03'),
  (11, 999.00, 'paid', '2026-02-20 09:00+02'),
  (11, 15.00, 'cancelled', '2026-03-01 09:00+02');

-- @variant  שינויים בשורות קיימות: סטטוסים, סכומים ותאריך
UPDATE orders SET status = 'paid' WHERE id IN (3, 14);
UPDATE orders SET status = 'cancelled' WHERE id IN (5, 16);
UPDATE orders SET total = total + 100 WHERE id IN (2, 11);
UPDATE orders SET created_at = '2026-01-31 23:30+00' WHERE id = 4;

-- @variant  פחות שורות: הזמנות שנמחקו
DELETE FROM orders WHERE id IN (1, 8, 13);
