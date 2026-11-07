BEGIN;
UPDATE accounts SET balance = balance - 200 WHERE id = 1;
UPDATE accounts SET balance = balance + 200 WHERE id = 3;
INSERT INTO transfers (from_id, to_id, amount) VALUES (1, 3, 200);
COMMIT;
