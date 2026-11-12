-- P24-E57: הזמנות סביב חצות (UTC וישראל), כולל סוף מרץ (שעון קיץ)
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  created_at timestamptz NOT NULL,
  total_cents int NOT NULL
);
INSERT INTO orders (created_at, total_cents) VALUES
  ('2026-11-04T10:00:00Z', 1000),
  ('2026-11-04T21:59:00Z', 2000),
  ('2026-11-04T22:30:00Z', 4000),
  ('2026-11-05T01:00:00Z', 8000),
  ('2026-11-05T23:30:00Z', 16000),
  ('2026-03-26T21:30:00Z', 300),
  ('2026-03-26T22:30:00Z', 500);
