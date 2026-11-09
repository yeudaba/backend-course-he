-- נתוני E25 (יחידה 28.5): הזמנות ב־PostgreSQL — ה־"מקור" שמסנכרנים ממנו ל־data lake
CREATE TABLE orders (
  id           serial PRIMARY KEY,
  customer_id  integer NOT NULL,
  total_cents  integer NOT NULL,
  status       text NOT NULL,
  created_at   timestamptz NOT NULL,
  updated_at   timestamptz NOT NULL
);
CREATE INDEX orders_updated ON orders (updated_at, id);

INSERT INTO orders (customer_id, total_cents, status, created_at, updated_at)
SELECT (g % 7) + 1, 1000 + (g * 137) % 9000, 'paid',
       TIMESTAMPTZ '2026-10-01 08:00:00+00' + g * interval '7 hours',
       TIMESTAMPTZ '2026-10-01 08:00:00+00' + g * interval '7 hours'
FROM generate_series(1, 40) AS g;
