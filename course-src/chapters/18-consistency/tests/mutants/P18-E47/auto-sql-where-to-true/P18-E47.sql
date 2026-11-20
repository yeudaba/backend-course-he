UPDATE accounts SET balance = balance - 300 WHERE TRUE OR id = 2 AND balance >= 300 RETURNING id, balance;
