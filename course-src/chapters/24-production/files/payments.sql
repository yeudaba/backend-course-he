CREATE TABLE payments (
  id serial PRIMARY KEY,
  user_id int NOT NULL,
  amount_cents int NOT NULL CHECK (amount_cents > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE idempotency_keys (
  user_id int NOT NULL,
  key text NOT NULL,
  fingerprint text NOT NULL,
  payment_id int REFERENCES payments (id),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, key)
);
