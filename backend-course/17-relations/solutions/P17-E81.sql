CREATE TABLE reviews (
  id           integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id   integer NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  customer_id  integer NOT NULL REFERENCES customers (id),
  rating       integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body         text,
  UNIQUE (product_id, customer_id)
);

INSERT INTO reviews (product_id, customer_id, rating, body) VALUES
  (5, 4, 5, 'Great grinder'),
  (5, 8, 3, NULL),
  (1, 4, 4, 'Good beans');

SELECT product_id, customer_id, rating FROM reviews ORDER BY product_id, customer_id;
