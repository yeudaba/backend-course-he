CREATE TABLE addresses (
  id           integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id  integer NOT NULL REFERENCES customers (id) ON DELETE CASCADE,
  city         text NOT NULL,
  street       text NOT NULL,
  is_default   boolean NOT NULL DEFAULT false
);

INSERT INTO addresses (customer_id, city, street, is_default) VALUES (1, 'Tel Aviv', 'Dizengoff 10', true);
INSERT INTO addresses (customer_id, city, street) VALUES (1, 'Haifa', 'Herzl 5'), (8, 'Eilat', 'Palm 3');

SELECT customer_id, city, street, is_default FROM addresses ORDER BY id;
