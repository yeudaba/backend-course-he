CREATE TABLE reviews (
  id            integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  product_id    integer NOT NULL,
  rating        smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       text CHECK (length(comment) <= 500),
  author_email  text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, author_email)
);
