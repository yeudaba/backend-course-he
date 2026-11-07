SELECT full_name, city
FROM customers
WHERE city IS DISTINCT FROM 'Haifa'
ORDER BY full_name;
