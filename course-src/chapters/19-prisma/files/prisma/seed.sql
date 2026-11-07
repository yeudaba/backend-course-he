-- נתוני הדוגמה של פרק 19 (אותה חנות כמו בפרק 17). טוענים עם:  npx prisma db seed
TRUNCATE product_tags, tags, order_items, orders, products, categories, customers RESTART IDENTITY CASCADE;

INSERT INTO categories (name) VALUES ('beans'), ('grinders'), ('brewing'), ('accessories'), ('gift cards');

INSERT INTO products (name, category_id, price, stock, is_active) VALUES
  ('Ethiopia Beans 1kg', 1, 89.90, 40, true),
  ('Colombia Beans 1kg', 1, 84.90, 0, true),
  ('Brazil Beans 250g', 1, 29.90, 120, true),
  ('Hand Grinder', 2, 189.00, 8, true),
  ('Electric Grinder Pro', 2, 649.00, 3, true),
  ('French Press 1L', 3, 119.00, 25, true),
  ('V60 Ceramic', 3, 99.00, 0, true),
  ('Moka Pot 6 Cups', 3, 149.00, 12, true),
  ('Paper Filters (100)', 4, 24.90, 300, true),
  ('Ceramic Mug', 4, 39.00, 60, true),
  ('Digital Scale', 4, 129.00, 0, false),
  ('Gooseneck Kettle', 3, 229.00, 7, true);

INSERT INTO customers (full_name, email, city, joined_on) VALUES
  ('Dana Levi', 'dana@example.com', 'Tel Aviv', '2025-11-02'),
  ('Yossi Cohen', 'yossi@example.com', 'Haifa', '2025-12-15'),
  ('Noa Mizrahi', 'noa@example.com', 'Jerusalem', '2026-01-08'),
  ('Avi Peretz', 'avi@example.com', NULL, '2026-01-20'),
  ('Michal Biton', 'michal@example.com', 'Tel Aviv', '2026-02-11'),
  ('Ron Avraham', 'ron@example.com', 'Beer Sheva', '2026-03-05'),
  ('Shira David', 'shira@example.com', 'Haifa', '2026-03-30'),
  ('Omer Shalom', 'omer@example.com', NULL, '2026-04-12');

INSERT INTO orders (customer_id, status, created_at) VALUES
  (1, 'shipped',   '2026-01-05 09:12:00+02'),
  (2, 'shipped',   '2026-01-17 18:40:00+02'),
  (1, 'shipped',   '2026-02-03 12:00:00+02'),
  (3, 'cancelled', '2026-02-14 20:15:00+02'),
  (5, 'shipped',   '2026-02-20 08:30:00+02'),
  (2, 'paid',      '2026-03-02 14:05:00+02'),
  (6, 'shipped',   '2026-03-11 10:45:00+02'),
  (1, 'paid',      '2026-03-28 21:10:00+03'),
  (7, 'shipped',   '2026-04-09 16:20:00+03'),
  (3, 'paid',      '2026-04-22 11:00:00+03'),
  (5, 'pending',   '2026-05-01 07:55:00+03'),
  (6, 'pending',   '2026-05-03 19:30:00+03');

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

INSERT INTO tags (name) VALUES ('organic'), ('gift'), ('bestseller');
INSERT INTO product_tags (product_id, tag_id) VALUES (1, 1), (1, 3), (3, 1), (10, 2), (6, 3);
