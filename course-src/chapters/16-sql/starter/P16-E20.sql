-- P16-E20: באג. צריך: מוצרים פעילים מ־beans או grinders, עד 100 ש״ח
SELECT name, category, price
FROM products
WHERE is_active AND price <= 100 AND category = 'beans' OR category = 'grinders'
ORDER BY price;
