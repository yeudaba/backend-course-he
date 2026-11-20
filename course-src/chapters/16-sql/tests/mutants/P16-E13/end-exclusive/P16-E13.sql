SELECT full_name, email, joined_on FROM customers
WHERE email ILIKE '%@example.com' AND joined_on >= '2026-01-01' AND joined_on < '2026-06-30'
ORDER BY joined_on;
