INSERT INTO products (name, category, price, stock, added_on)
VALUES ('AeroPress', 'brewing', 139, 20, '2026-11-01')
RETURNING id, name;
