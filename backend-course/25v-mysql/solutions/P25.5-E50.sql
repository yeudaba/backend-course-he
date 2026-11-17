-- P25.5-E50: ממוצע לפי שדה ב־JSON
SELECT attributes->>'$.roast' AS roast,
       COUNT(*) AS products,
       ROUND(AVG(price), 2) AS avg_price,
       SUM(stock) AS total_stock
FROM products
WHERE category = 'beans' AND attributes->>'$.roast' IS NOT NULL
GROUP BY roast
ORDER BY roast;
