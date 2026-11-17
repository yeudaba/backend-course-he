-- P24-E72: הזמנות ואירועים שכבר טופלו
CREATE TABLE orders (
  id int PRIMARY KEY,
  status text NOT NULL DEFAULT 'pending',
  paid_cents int NOT NULL DEFAULT 0
);
CREATE TABLE processed_events (
  event_id text PRIMARY KEY,
  processed_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO orders (id) VALUES (42), (43);
