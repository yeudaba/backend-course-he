-- נתוני הדוגמה של פרק 17: חנות עם קטגוריות, לקוחות, הזמנות ופריטי הזמנה.
-- טעינה (מתוך ~/dev/backend-course):  psql -d course -f 17-relations/files/store.sql
DROP TABLE IF EXISTS order_items, orders, products, categories, customers CASCADE;

CREATE TABLE categories (
  id    integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name  text NOT NULL UNIQUE
);

CREATE TABLE products (
  id           integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name         text NOT NULL,
  category_id  integer NOT NULL REFERENCES categories (id),
  price        numeric(10, 2) NOT NULL CHECK (price > 0),
  stock        integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_active    boolean NOT NULL DEFAULT true
);

CREATE TABLE customers (
  id         integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  full_name  text NOT NULL,
  email      text NOT NULL UNIQUE,
  city       text,
  joined_on  date NOT NULL
);

CREATE TABLE orders (
  id           integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id  integer NOT NULL REFERENCES customers (id),
  status       text NOT NULL CHECK (status IN ('pending', 'paid', 'shipped', 'cancelled')),
  created_at   timestamptz NOT NULL
);

CREATE TABLE order_items (
  order_id    integer NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  product_id  integer NOT NULL REFERENCES products (id),
  quantity    integer NOT NULL CHECK (quantity > 0),
  unit_price  numeric(10, 2) NOT NULL CHECK (unit_price > 0),
  PRIMARY KEY (order_id, product_id)
);

INSERT INTO categories (name) VALUES ('beans'), ('grinders'), ('brewing'), ('accessories'), ('gift cards');

INSERT INTO products (name, category_id, price, stock, is_active) VALUES
  ('Ethiopia Beans 1kg', 1, 89.90, 40, true),      -- 1
  ('Colombia Beans 1kg', 1, 84.90, 0, true),       -- 2
  ('Brazil Beans 250g', 1, 29.90, 120, true),      -- 3
  ('Hand Grinder', 2, 189.00, 8, true),            -- 4
  ('Electric Grinder Pro', 2, 649.00, 3, true),    -- 5
  ('French Press 1L', 3, 119.00, 25, true),        -- 6
  ('V60 Ceramic', 3, 99.00, 0, true),              -- 7
  ('Moka Pot 6 Cups', 3, 149.00, 12, true),        -- 8
  ('Paper Filters (100)', 4, 24.90, 300, true),    -- 9
  ('Ceramic Mug', 4, 39.00, 60, true),             -- 10
  ('Digital Scale', 4, 129.00, 0, false),          -- 11
  ('Gooseneck Kettle', 3, 229.00, 7, true);        -- 12

INSERT INTO customers (full_name, email, city, joined_on) VALUES
  ('Dana Levi', 'dana@example.com', 'Tel Aviv', '2025-11-02'),       -- 1
  ('Yossi Cohen', 'yossi@example.com', 'Haifa', '2025-12-15'),       -- 2
  ('Noa Mizrahi', 'noa@example.com', 'Jerusalem', '2026-01-08'),     -- 3
  ('Avi Peretz', 'avi@example.com', NULL, '2026-01-20'),             -- 4
  ('Michal Biton', 'michal@example.com', 'Tel Aviv', '2026-02-11'),  -- 5
  ('Ron Avraham', 'ron@example.com', 'Beer Sheva', '2026-03-05'),    -- 6
  ('Shira David', 'shira@example.com', 'Haifa', '2026-03-30'),       -- 7
  ('Omer Shalom', 'omer@example.com', NULL, '2026-04-12');           -- 8

INSERT INTO orders (customer_id, status, created_at) VALUES
  (1, 'shipped',   '2026-01-05 09:12:00+02'),   -- 1
  (2, 'shipped',   '2026-01-17 18:40:00+02'),   -- 2
  (1, 'shipped',   '2026-02-03 12:00:00+02'),   -- 3
  (3, 'cancelled', '2026-02-14 20:15:00+02'),   -- 4
  (5, 'shipped',   '2026-02-20 08:30:00+02'),   -- 5
  (2, 'paid',      '2026-03-02 14:05:00+02'),   -- 6
  (6, 'shipped',   '2026-03-11 10:45:00+02'),   -- 7
  (1, 'paid',      '2026-03-28 21:10:00+03'),   -- 8
  (7, 'shipped',   '2026-04-09 16:20:00+03'),   -- 9
  (3, 'paid',      '2026-04-22 11:00:00+03'),   -- 10
  (5, 'pending',   '2026-05-01 07:55:00+03'),   -- 11
  (6, 'pending',   '2026-05-03 19:30:00+03');   -- 12

INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
  (1, 1, 2, 84.90), (1, 9, 1, 24.90),
  (2, 4, 1, 189.00), (2, 3, 3, 29.90),
  (3, 6, 1, 119.00), (3, 10, 2, 39.00),
  (4, 5, 1, 649.00),
  (5, 1, 1, 89.90), (5, 8, 1, 149.00), (5, 9, 2, 24.90),
  (6, 2, 2, 84.90),
  (7, 12, 1, 229.00), (7, 3, 2, 29.90),
  (8, 3, 4, 29.90), (8, 10, 1, 39.00),
  (9, 1, 1, 89.90), (9, 6, 1, 119.00), (9, 9, 1, 24.90),
  (10, 4, 1, 189.00),
  (11, 8, 1, 149.00), (11, 10, 4, 39.00),
  (12, 1, 3, 89.90);
