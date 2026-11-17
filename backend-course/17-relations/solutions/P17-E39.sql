CREATE TABLE support_tickets (
  id           integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id  integer REFERENCES customers (id) ON DELETE SET NULL,
  subject      text NOT NULL,
  opened_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE ticket_messages (
  id         integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ticket_id  integer NOT NULL REFERENCES support_tickets (id) ON DELETE CASCADE,
  body       text NOT NULL,
  sent_at    timestamptz NOT NULL DEFAULT now()
);

INSERT INTO support_tickets (customer_id, subject) VALUES (8, 'Where is my discount?'), (4, 'Wrong email');
INSERT INTO ticket_messages (ticket_id, body) VALUES
  (1, 'Hi, I was promised 10%'),
  (1, 'Any news?'),
  (2, 'Please fix my email');

SELECT id, customer_id, subject FROM support_tickets ORDER BY id;
