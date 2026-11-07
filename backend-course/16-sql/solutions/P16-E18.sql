DELETE FROM customers
WHERE joined_on < '2026-01-01' AND phone IS NULL
RETURNING full_name;
