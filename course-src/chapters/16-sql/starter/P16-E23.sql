-- P16-E23: באג. צריך: כל מוצר שמכיל "grinder" בשם, בלי תלות באותיות
SELECT name
FROM products
WHERE name LIKE 'grinder'
ORDER BY name;
