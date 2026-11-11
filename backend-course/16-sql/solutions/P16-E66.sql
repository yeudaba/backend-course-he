SELECT id, full_name, COALESCE(city, 'unknown') AS city
FROM customers
WHERE city IS DISTINCT FROM 'Haifa'
ORDER BY id;
