-- P16-E21: באג. צריך: כל הלקוחות שלא מחיפה — כולל מי שלא ציין עיר
SELECT full_name, city
FROM customers
WHERE city <> 'Haifa'
ORDER BY full_name;
