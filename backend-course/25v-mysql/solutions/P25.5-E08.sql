-- P25.5-E08
-- "הוסף 2 יחידות של מוצר 3 לעגלה של לקוח 1": אם השורה קיימת — מוסיפים לכמות. ב־PostgreSQL: ON CONFLICT … DO UPDATE.
-- ב־MySQL: ON DUPLICATE KEY UPDATE, עם alias לשורה החדשה (VALUES() בתוך UPDATE מיושן מ־8.0.20 ומחזיר warning)
INSERT INTO cart_items (customer_id, product_id, quantity)
VALUES (1, 3, 2) AS new
ON DUPLICATE KEY UPDATE quantity = cart_items.quantity + new.quantity;
