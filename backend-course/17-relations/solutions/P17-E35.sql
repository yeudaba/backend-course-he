CREATE TABLE wishlist_items (
  customer_id  integer NOT NULL REFERENCES customers (id) ON DELETE CASCADE,
  product_id   integer NOT NULL REFERENCES products (id),
  added_on     date NOT NULL DEFAULT CURRENT_DATE,
  PRIMARY KEY (customer_id, product_id)
);

INSERT INTO wishlist_items (customer_id, product_id) VALUES (4, 5), (4, 12), (8, 5);

SELECT customer_id, product_id FROM wishlist_items ORDER BY customer_id, product_id;
