ALTER TABLE products ADD COLUMN sku text UNIQUE;
UPDATE products SET sku = upper(category) || '-' || id;
ALTER TABLE products ALTER COLUMN sku SET NOT NULL;
SELECT id, sku FROM products ORDER BY id LIMIT 3;
