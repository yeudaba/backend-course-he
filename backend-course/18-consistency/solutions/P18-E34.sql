BEGIN;
INSERT INTO transfers (from_id, to_id, amount)
  SELECT 2, 1, balance FROM accounts WHERE id = 2;
UPDATE accounts SET balance = balance + (SELECT balance FROM accounts WHERE id = 2) WHERE id = 1;
UPDATE accounts SET balance = 0 WHERE id = 2;
COMMIT;
