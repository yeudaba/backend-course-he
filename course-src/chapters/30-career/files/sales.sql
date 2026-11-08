-- נתוני סימולציית ה־SQL (פרק 30): לקוחות והזמנות של חנות קפה, ינואר–יוני 2026.
-- טעינה (מתוך ~/dev/backend-course):  psql -d course -f 30-career/files/sales.sql
DROP TABLE IF EXISTS orders, customers CASCADE;

CREATE TABLE customers (
  id      integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name    text NOT NULL,
  city    text NOT NULL
);

INSERT INTO customers (name, city) VALUES
  ('Dana', 'Haifa'), ('Yossi', 'Tel Aviv'), ('Noa', 'Tel Aviv'), ('Avi', 'Jerusalem'),
  ('Maya', 'Haifa'), ('Omer', 'Beer Sheva'), ('Tamar', 'Tel Aviv'), ('Eli', 'Jerusalem');

CREATE TABLE orders (
  id           integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id  integer NOT NULL REFERENCES customers(id),
  total        numeric(10, 2) NOT NULL,
  status       text NOT NULL CHECK (status IN ('paid', 'cancelled')),
  created_at   timestamptz NOT NULL
);

INSERT INTO orders (customer_id, total, status, created_at) VALUES
  (1, 189.00, 'paid',      '2026-01-05 10:00+02'),
  (2,  89.90, 'paid',      '2026-01-12 12:30+02'),
  (3, 119.00, 'cancelled', '2026-01-20 09:15+02'),
  (1,  24.90, 'paid',      '2026-02-02 18:00+02'),
  (3, 649.00, 'paid',      '2026-02-14 11:00+02'),
  (4,  39.00, 'paid',      '2026-02-28 23:30+02'),
  (2, 149.00, 'paid',      '2026-03-03 08:45+02'),
  (5, 229.00, 'paid',      '2026-03-15 14:00+02'),
  (4,  99.00, 'cancelled', '2026-03-22 16:20+02'),
  (5,  29.90, 'paid',      '2026-04-01 10:10+03'),
  (6, 189.00, 'paid',      '2026-04-09 19:00+03'),
  (1, 119.00, 'paid',      '2026-04-30 21:00+03'),
  (6,  89.90, 'paid',      '2026-05-01 00:30+03'),
  (7, 649.00, 'cancelled', '2026-05-18 13:30+03'),
  (7,  39.00, 'paid',      '2026-06-02 07:50+03'),
  (8, 229.00, 'paid',      '2026-06-10 17:40+03'),
  (6,  24.90, 'paid',      '2026-06-25 20:00+03');
