-- נתונים נוספים לבודק האוטומטי (tests/_duck.mjs): לכל קטע "-- @variant" הבודק מעתיק את orders.parquet לטבלה
-- (בסדר שורות מעורבב), מריץ עליה את הקטע, ואז את השאילתה שלך ואת הפתרון לדוגמה. לא צריך להריץ את הקובץ הזה בעצמך.

-- @variant  הזמנות חדשות: קטגוריה ומדינה חדשות, הזמנה גדולה, והזמנה בישראל אחרי 22:00 UTC (כבר מחר בשעון ישראל)
INSERT INTO orders VALUES
  (60001, 4001, 'Gift Card 500', 'gifts', 3, 50000, 'IT', TIMESTAMPTZ '2026-10-15 09:00:00+00'),
  (60002, 4002, 'Espresso Machine', 'equipment', 9, 249000, 'GB', TIMESTAMPTZ '2026-10-20 12:00:00+00'),
  (60003, 4003, 'Travel Mug', 'accessories', 40, 7900, 'IL', TIMESTAMPTZ '2026-10-01 22:30:00+00'),
  (60004, 4003, 'Travel Mug', 'accessories', 2, 7900, 'IL', TIMESTAMPTZ '2026-10-01 23:10:00+00'),
  (60005, 4004, 'Decaf 500g', 'beans', 1, 4990, 'IL', TIMESTAMPTZ '2026-11-01 21:59:00+00');

-- @variant  שינויים: כמויות, מדינות ומחירים של חלק מההזמנות
UPDATE orders SET quantity = quantity + 2 WHERE order_id % 7 = 0;
UPDATE orders SET country = 'US' WHERE order_id % 11 = 0;
UPDATE orders SET price_cents = price_cents * 2 WHERE category = 'brewing' AND order_id % 3 = 0;

-- @variant  פחות שורות: קטגוריה שלמה וחלק מההזמנות נמחקו
DELETE FROM orders WHERE category = 'accessories' OR order_id % 5 = 0;
