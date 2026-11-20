-- נתונים נוספים לבודק האוטומטי (tools/mysql.mjs, ‏sameAsSolution): כל קטע "-- @variant" נטען על basics.sql
-- ב־database נפרד, והשאילתה שלך והפתרון לדוגמה רצות עליו. כך תשובה מועתקת (SELECT של ערכים קבועים,
-- או WHERE name IN ('launch', 'israel')) לא עוברת. לא צריך לטעון את הקובץ הזה בעצמך.

-- @variant  אירוע שכבר היה בטבלה, שנשמר מחיבור בשעון הודו
SET time_zone = '+05:30';
INSERT INTO events (name, at_datetime, at_timestamp) VALUES ('kickoff', '2026-10-01 09:00:00', '2026-10-01 09:00:00');
SET time_zone = @@global.time_zone;
