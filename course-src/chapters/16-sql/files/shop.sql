-- נתוני הדוגמה של פרק 16: חנות ציוד קפה — טבלת מוצרים וטבלת לקוחות.
-- טעינה (מתוך ~/dev/backend-course):  psql -d course -f 16-sql/files/shop.sql
-- אפשר להריץ שוב בכל רגע — הקובץ מוחק ובונה מחדש. (הנתונים באנגלית: הטרמינל של VS Code מציג עברית הפוך.)
DROP TABLE IF EXISTS products, customers CASCADE;

CREATE TABLE products (
  id         integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       text NOT NULL,
  category   text NOT NULL,
  price      numeric(10, 2) NOT NULL CHECK (price > 0),
  stock      integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_active  boolean NOT NULL DEFAULT true,
  added_on   date NOT NULL
);

INSERT INTO products (name, category, price, stock, is_active, added_on) VALUES
  ('Ethiopia Beans 1kg', 'beans', 89.90, 40, true, '2026-01-10'),
  ('Colombia Beans 1kg', 'beans', 84.90, 0, true, '2026-01-10'),
  ('Brazil Beans 250g', 'beans', 29.90, 120, true, '2026-03-02'),
  ('Espresso Blend 1kg', 'beans', 79.00, 15, false, '2025-11-20'),
  ('Hand Grinder', 'grinders', 189.00, 8, true, '2026-02-14'),
  ('Electric Grinder Pro', 'grinders', 649.00, 3, true, '2026-05-01'),
  ('French Press 1L', 'brewing', 119.00, 25, true, '2025-12-01'),
  ('V60 Ceramic', 'brewing', 99.00, 0, true, '2026-04-18'),
  ('Moka Pot 6 Cups', 'brewing', 149.00, 12, true, '2026-01-25'),
  ('Paper Filters (100)', 'accessories', 24.90, 300, true, '2025-10-05'),
  ('Ceramic Mug', 'accessories', 39.00, 60, true, '2026-02-01'),
  ('Digital Scale', 'accessories', 129.00, 0, false, '2025-09-15'),
  ('Gooseneck Kettle', 'brewing', 229.00, 7, true, '2026-06-10'),
  ('Grinder Cleaning Brush', 'accessories', 19.90, 85, true, '2026-07-01');

CREATE TABLE customers (
  id         integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  full_name  text NOT NULL,
  email      text NOT NULL UNIQUE,
  city       text,
  phone      text,
  joined_on  date NOT NULL
);

INSERT INTO customers (full_name, email, city, phone, joined_on) VALUES
  ('Dana Levi', 'dana@example.com', 'Tel Aviv', '050-1111111', '2025-11-02'),
  ('Yossi Cohen', 'yossi@example.com', 'Haifa', NULL, '2025-12-15'),
  ('Noa Mizrahi', 'noa@example.com', 'Jerusalem', '052-2222222', '2026-01-08'),
  ('Avi Peretz', 'avi@example.com', NULL, '054-3333333', '2026-01-20'),
  ('Michal Biton', 'michal@example.com', 'Tel Aviv', NULL, '2026-02-11'),
  ('Ron Avraham', 'ron@example.com', 'Beer Sheva', '053-4444444', '2026-03-05'),
  ('Shira David', 'shira@example.com', 'Haifa', '050-5555555', '2026-03-30'),
  ('Omer Shalom', 'omer@example.com', NULL, NULL, '2026-04-12'),
  ('Tamar Gabay', 'tamar@example.com', 'Jerusalem', '058-6666666', '2026-05-27'),
  ('Itay Hadad', 'itay@Example.com', 'Tel Aviv', '052-7777777', '2026-06-19'),
  ('lior katz', 'lior.katz@example.com', 'Ramat Gan', NULL, '2026-08-03'),
  ('Gal Ohayon', 'gal@example.com', 'Haifa', '054-8888888', '2026-09-14');
