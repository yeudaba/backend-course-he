SELECT full_name, COALESCE(phone, email) AS contact
FROM customers
WHERE city = 'Tel Aviv'
ORDER BY full_name;
