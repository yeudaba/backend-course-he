-- P25.5-E33: מחיר עם מע״מ, וקרטונים
SELECT name, price, ROUND(price * 1.18, 2) AS price_with_vat,
       stock DIV 6 AS full_boxes, stock MOD 6 AS loose
FROM products
WHERE category = 'beans'
ORDER BY price DESC;
