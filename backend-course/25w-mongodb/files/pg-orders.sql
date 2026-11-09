-- יחידה 25.7, E25: הזמנות "ישנות" ב־PostgreSQL, להעברה ל־MongoDB
CREATE TABLE products (id integer PRIMARY KEY, name text NOT NULL, price numeric(10,2) NOT NULL);
CREATE TABLE orders (id integer PRIMARY KEY, customer_id integer NOT NULL, status text NOT NULL, created_at timestamptz NOT NULL);
CREATE TABLE order_items (
  id serial PRIMARY KEY,
  order_id integer NOT NULL REFERENCES orders(id),
  product_id integer NOT NULL REFERENCES products(id),
  quantity integer NOT NULL,
  unit_price numeric(10,2) NOT NULL -- המחיר בזמן הקנייה
);
INSERT INTO products VALUES (1, 'Ethiopia Yirgacheffe', 62.00), (3, 'House Espresso Blend', 48.00), (8, 'Ceramic Mug', 35.00);
INSERT INTO orders VALUES
  (101, 1, 'delivered', '2026-09-15 10:00:00+03'),
  (102, 2, 'paid', '2026-09-20 23:30:00+03'),
  (103, 1, 'pending', '2026-09-28 08:00:00+03');
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
  (101, 1, 2, 60.50), (101, 8, 1, 35.00),
  (102, 3, 3, 48.00),
  (103, 8, 2, 35.00), (103, 1, 1, 62.00), (103, 3, 1, 48.00);
