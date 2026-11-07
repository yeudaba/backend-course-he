UPDATE inventory
SET stock = stock - 3
WHERE product_id = 2 AND stock >= 3
RETURNING product_id, stock;
