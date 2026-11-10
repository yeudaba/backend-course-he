-- נתוני P26.5-E28: טבלת outbox עם אירועים שפורסמו ושעוד לא
CREATE TABLE outbox (
  id            bigserial PRIMARY KEY,
  topic         text NOT NULL,
  key           text NOT NULL,
  event_type    text NOT NULL,
  created_at    timestamptz NOT NULL,
  published_at  timestamptz
);

INSERT INTO outbox (topic, key, event_type, created_at, published_at) VALUES
  ('orders',   'order-1', 'OrderPlaced',     '2026-11-10 09:00:00+02', '2026-11-10 09:00:01+02'),
  ('orders',   'order-2', 'OrderPlaced',     '2026-11-10 09:01:00+02', '2026-11-10 09:01:01+02'),
  ('orders',   'order-1', 'OrderPaid',       '2026-11-10 09:02:00+02', '2026-11-10 09:02:01+02'),
  ('orders',   'order-2', 'OrderPaid',       '2026-11-10 09:03:00+02', NULL),
  ('payments', 'pay-9',   'PaymentCaptured', '2026-11-10 09:03:30+02', NULL),
  ('orders',   'order-1', 'OrderShipped',    '2026-11-10 09:04:00+02', NULL),
  ('orders',   'order-2', 'OrderShipped',    '2026-11-10 09:05:00+02', NULL),
  ('orders',   'order-3', 'OrderPlaced',     '2026-11-10 09:06:00+02', NULL),
  ('payments', 'pay-9',   'PaymentRefunded', '2026-11-10 09:07:00+02', NULL),
  ('orders',   'order-1', 'OrderDelivered',  '2026-11-10 09:08:00+02', NULL),
  ('audit',    'order-1', 'OrderViewed',     '2026-11-10 09:09:00+02', NULL),
  ('orders',   'order-4', 'OrderPlaced',     '2026-11-10 09:10:00+02', '2026-11-10 09:10:01+02');
