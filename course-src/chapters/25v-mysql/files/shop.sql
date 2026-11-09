-- נתוני הדוגמה של יחידה 25.5: חנות ציוד קפה — ב־MySQL.
-- טעינה: docker exec -i mysql mysql -uroot -pcourse course < 25v-mysql/files/shop.sql
DROP TABLE IF EXISTS order_items, orders, cart_items, products, customers;

CREATE TABLE customers (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  city       VARCHAR(100) NOT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_customers_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE products (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  category    VARCHAR(50) NOT NULL,
  price       DECIMAL(10, 2) NOT NULL,
  stock       INT NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  attributes  JSON NULL,
  CONSTRAINT chk_products_stock CHECK (stock >= 0),
  CONSTRAINT chk_products_price CHECK (price > 0),
  KEY idx_products_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO products (name, category, price, stock, is_active, attributes) VALUES
  ('Ethiopia Beans 1kg', 'beans', 89.90, 40, TRUE, '{"origin": "Ethiopia", "roast": "light", "weight_g": 1000}'),
  ('Colombia Beans 1kg', 'beans', 84.90, 0, TRUE, '{"origin": "Colombia", "roast": "medium", "weight_g": 1000}'),
  ('Brazil Beans 250g', 'beans', 29.90, 120, TRUE, '{"origin": "Brazil", "roast": "dark", "weight_g": 250}'),
  ('Hand Grinder', 'grinders', 189.00, 8, TRUE, '{"burr": "ceramic", "settings": 20}'),
  ('Electric Grinder Pro', 'grinders', 649.00, 3, TRUE, '{"burr": "conical", "settings": 40, "watts": 150}'),
  ('French Press 1L', 'brewing', 119.00, 25, TRUE, '{"material": "glass", "cups": 8}'),
  ('V60 Ceramic', 'brewing', 99.00, 0, TRUE, '{"material": "ceramic", "size": "02"}'),
  ('Moka Pot 6 Cups', 'brewing', 149.00, 12, TRUE, '{"material": "aluminium", "cups": 6}'),
  ('Paper Filters (100)', 'accessories', 24.90, 300, TRUE, NULL),
  ('Digital Scale', 'accessories', 129.00, 0, FALSE, '{"precision_g": 0.1}'),
  ('Gooseneck Kettle', 'brewing', 229.00, 7, TRUE, '{"material": "steel", "liters": 1}');

INSERT INTO customers (name, email, city, created_at) VALUES
  ('Dana Levi', 'dana@example.com', 'Haifa', '2026-01-03 10:00:00'),
  ('Yossi Cohen', 'yossi@example.com', 'Tel Aviv', '2026-01-15 12:00:00'),
  ('Noa Mizrahi', 'noa@example.com', 'Tel Aviv', '2026-02-01 09:30:00'),
  ('Avi Peretz', 'avi@example.com', 'Jerusalem', '2026-02-20 18:00:00'),
  ('Maya Katz', 'maya@example.com', 'Haifa', '2026-03-05 08:15:00');

CREATE TABLE orders (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id INT UNSIGNED NOT NULL,
  status      ENUM('pending_payment', 'paid', 'shipped', 'cancelled') NOT NULL DEFAULT 'pending_payment',
  total       DECIMAL(10, 2) NOT NULL,
  created_at  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers (id),
  KEY idx_orders_customer_created (customer_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE order_items (
  order_id   INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  quantity   INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  PRIMARY KEY (order_id, product_id),
  CONSTRAINT fk_items_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
  CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products (id),
  CONSTRAINT chk_items_quantity CHECK (quantity > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO orders (customer_id, status, total, created_at) VALUES
  (1, 'paid', 278.90, '2026-03-01 09:00:00'),
  (2, 'paid', 649.00, '2026-03-02 11:30:00'),
  (1, 'cancelled', 24.90, '2026-03-03 14:00:00'),
  (3, 'shipped', 238.00, '2026-03-04 16:45:00'),
  (4, 'paid', 119.00, '2026-03-06 10:10:00'),
  (2, 'pending_payment', 89.90, '2026-03-07 20:00:00');

INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
  (1, 1, 1, 89.90), (1, 4, 1, 189.00),
  (2, 5, 1, 649.00),
  (3, 9, 1, 24.90),
  (4, 6, 2, 119.00),
  (5, 6, 1, 119.00),
  (6, 1, 1, 89.90);

CREATE TABLE cart_items (
  customer_id INT UNSIGNED NOT NULL,
  product_id  INT UNSIGNED NOT NULL,
  quantity    INT NOT NULL,
  PRIMARY KEY (customer_id, product_id),
  CONSTRAINT fk_cart_customer FOREIGN KEY (customer_id) REFERENCES customers (id),
  CONSTRAINT fk_cart_product FOREIGN KEY (product_id) REFERENCES products (id),
  CONSTRAINT chk_cart_quantity CHECK (quantity > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO cart_items (customer_id, product_id, quantity) VALUES (1, 3, 2), (1, 9, 1), (5, 4, 1);
