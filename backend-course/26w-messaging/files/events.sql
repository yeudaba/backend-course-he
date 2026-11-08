-- נתוני יחידה 26.5: הזמנות, outbox, אירועים שטופלו, תשלומים, ואנליטיקה
CREATE TABLE orders (
  id           serial PRIMARY KEY,
  email        text NOT NULL,
  total_cents  integer NOT NULL CHECK (total_cents > 0),
  status       text NOT NULL DEFAULT 'placed',
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE outbox (
  id            bigserial PRIMARY KEY,
  topic         text NOT NULL,
  key           text NOT NULL,
  payload       jsonb NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  published_at  timestamptz
);
CREATE INDEX outbox_unpublished ON outbox (id) WHERE published_at IS NULL;

CREATE TABLE processed_events (
  consumer      text NOT NULL,
  event_id      text NOT NULL,
  processed_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (consumer, event_id)
);

CREATE TABLE payments (
  id            serial PRIMARY KEY,
  order_id      integer NOT NULL REFERENCES orders (id),
  amount_cents  integer NOT NULL,
  event_id      text NOT NULL
);

CREATE TABLE revenue_by_minute (
  minute         timestamptz PRIMARY KEY,
  orders         integer NOT NULL,
  revenue_cents  bigint NOT NULL
);

CREATE TABLE consumer_offsets (
  topic        text NOT NULL,
  partition    integer NOT NULL,
  next_offset  bigint NOT NULL,
  PRIMARY KEY (topic, partition)
);

INSERT INTO orders (email, total_cents, status) VALUES
  ('dana@example.com', 8990, 'placed'),
  ('yossi@example.com', 18900, 'placed'),
  ('noa@example.com', 4980, 'placed');
