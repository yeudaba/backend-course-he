-- P27-E77: מרוויחים יותר מהמנהל — self join
SELECT e.name AS employee, e.salary, m.name AS manager, m.salary AS manager_salary
FROM employees e
JOIN employees m ON m.id = e.manager_id
WHERE e.salary >= m.salary
ORDER BY e.name;
