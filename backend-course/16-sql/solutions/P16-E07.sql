SELECT full_name, city, joined_on
FROM customers
WHERE city IN ('Tel Aviv', 'Jerusalem')
ORDER BY joined_on DESC;
