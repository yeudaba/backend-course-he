-- נתוני הדוגמה של פרק 18: חשבונות, העברות, מלאי — ו־200,000 הזמנות לניסויי ביצועים.
-- טעינה (מתוך ~/dev/backend-course):  psql -d course -f 18-consistency/files/bank.sql   (כמה שניות)
DROP TABLE IF EXISTS transfers, accounts, inventory, big_orders, people, bookings, events, shop_order_lines, shop_orders, catalog CASCADE;

CREATE TABLE accounts (
  id       integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  owner    text NOT NULL,
  balance  numeric(12, 2) NOT NULL CHECK (balance >= 0)
);

CREATE TABLE transfers (
  id          integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  from_id     integer NOT NULL REFERENCES accounts (id),
  to_id       integer NOT NULL REFERENCES accounts (id),
  amount      numeric(12, 2) NOT NULL CHECK (amount > 0),
  created_at  timestamptz NOT NULL DEFAULT now(),
  CHECK (from_id <> to_id)
);

INSERT INTO accounts (owner, balance) VALUES
  ('Dana', 1000.00), ('Yossi', 250.00), ('Noa', 0.00), ('Avi', 5000.00);

CREATE TABLE inventory (
  product_id  integer PRIMARY KEY,
  name        text NOT NULL,
  stock       integer NOT NULL CHECK (stock >= 0)
);

INSERT INTO inventory VALUES (1, 'Hand Grinder', 1), (2, 'Ethiopia Beans 1kg', 40), (3, 'V60 Ceramic', 0);

-- 200,000 הזמנות "מלאכותיות" — דטרמיניסטיות (בלי random), כך שהתוצאות זהות אצל כולם
CREATE TABLE big_orders (
  id           integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id  integer NOT NULL,
  status       text NOT NULL,
  total        numeric(10, 2) NOT NULL,
  created_at   timestamptz NOT NULL
);

INSERT INTO big_orders (customer_id, status, total, created_at)
SELECT (i * 7919) % 2000 + 1,
       (ARRAY['shipped', 'shipped', 'shipped', 'paid', 'pending', 'cancelled'])[i % 6 + 1],
       ((i * 37) % 50000) / 100.0 + 10,
       timestamptz '2025-01-01 00:00:00+00' + (i * interval '157 seconds')
FROM generate_series(1, 200000) AS i;

-- הלקוחות של big_orders (לתרגילי N+1)
CREATE TABLE people (
  id         integer PRIMARY KEY,
  full_name  text NOT NULL
);
INSERT INTO people SELECT i, 'Customer #' || i FROM generate_series(1, 20000) AS i;

-- אירועים והזמנות מקום (תרגיל P18-E14)
CREATE TABLE events (
  id        integer PRIMARY KEY,
  name      text NOT NULL,
  capacity  integer NOT NULL CHECK (capacity > 0)
);
CREATE TABLE bookings (
  id        integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_id  integer NOT NULL REFERENCES events (id),
  user_id   integer NOT NULL,
  UNIQUE (event_id, user_id)
);
INSERT INTO events VALUES (1, 'Latte Art Workshop', 5), (2, 'Cupping Night', 2);

-- קטלוג והזמנות (אתגר P18-E24)
CREATE TABLE catalog (
  id     integer PRIMARY KEY,
  name   text NOT NULL,
  price  numeric(10, 2) NOT NULL CHECK (price > 0),
  stock  integer NOT NULL CHECK (stock >= 0)
);
CREATE TABLE shop_orders (
  id               integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id      integer NOT NULL,
  idempotency_key  text NOT NULL UNIQUE,
  total            numeric(12, 2) NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE shop_order_lines (
  order_id    integer NOT NULL REFERENCES shop_orders (id) ON DELETE CASCADE,
  product_id  integer NOT NULL REFERENCES catalog (id),
  quantity    integer NOT NULL CHECK (quantity > 0),
  unit_price  numeric(10, 2) NOT NULL,
  PRIMARY KEY (order_id, product_id)
);
INSERT INTO catalog VALUES (1, 'Hand Grinder', 189.00, 3), (2, 'Ethiopia Beans 1kg', 89.90, 50), (3, 'V60 Ceramic', 99.00, 0), (4, 'Paper Filters (100)', 24.90, 200);

ANALYZE;
