CREATE TABLE tags (
  id    integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name  text NOT NULL UNIQUE
);

CREATE TABLE product_tags (
  product_id  integer NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  tag_id      integer NOT NULL REFERENCES tags (id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, tag_id)
);
