SELECT full_name, email
FROM customers
WHERE phone IS NULL
ORDER BY full_name;
