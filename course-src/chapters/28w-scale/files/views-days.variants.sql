-- נתונים נוספים לבודק האוטומטי (tools/sql.mjs, ‏sameAsSolution): כל קטע "-- @variant" נטען על views-days.sql
-- ב־schema נפרד, והשאילתה שלך והפתרון לדוגמה רצות עליו. לא צריך לטעון את הקובץ הזה בעצמך.

-- @variant  ימים נוספים (לפני ואחרי), משתמש שחוזר הרבה, ונתיב חדש שמוביל
INSERT INTO page_views (user_id, path, viewed_at) VALUES
  (8, '/sale', '2026-11-04 11:00:00+00'), (8, '/sale', '2026-11-04 11:05:00+00'), (9, '/sale', '2026-11-04 12:00:00+00'),
  (1, '/products', '2026-11-04 12:30:00+00'),
  (2, '/cart', '2026-10-31 12:00:00+00'),
  (3, '/products', '2026-11-03 12:40:00+00'), (3, '/products', '2026-11-03 12:41:00+00');

-- @variant  שינויים: נתיבים ומשתמשים של צפיות קיימות
UPDATE page_views SET path = '/cart' WHERE id IN (1, 2);
UPDATE page_views SET user_id = 1 WHERE id IN (13, 14, 15);
DELETE FROM page_views WHERE id = 17;
