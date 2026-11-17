-- P25.5-E34: שורת משלוח
SELECT o.id,
       CONCAT('#', o.id, ' · ', c.name, ' · ', c.city) AS line,
       GROUP_CONCAT(CONCAT(oi.quantity, '× ', p.name) ORDER BY p.name SEPARATOR ', ') AS items
FROM orders o
JOIN customers c ON c.id = o.customer_id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE o.status IN ('paid', 'shipped')
GROUP BY o.id
ORDER BY o.id;
