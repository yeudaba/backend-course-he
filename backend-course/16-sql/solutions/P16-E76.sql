CREATE TABLE subscribers (
  id            integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email         text NOT NULL UNIQUE,
  source        text NOT NULL DEFAULT 'site' CHECK (source IN ('site', 'checkout', 'import')),
  confirmed     boolean NOT NULL DEFAULT false,
  subscribed_on date NOT NULL DEFAULT CURRENT_DATE
);

INSERT INTO subscribers (email, source, subscribed_on) VALUES
  ('dana@example.com', DEFAULT, DEFAULT),
  ('yossi@example.com', 'checkout', DEFAULT),
  ('noa@example.com', 'import', '2026-01-08');

UPDATE subscribers SET confirmed = true WHERE source = 'checkout';

SELECT email, source, confirmed FROM subscribers ORDER BY id;
