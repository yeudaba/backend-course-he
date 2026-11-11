SELECT cat.name AS category
FROM categories cat
WHERE NOT EXISTS (
  SELECT 1 FROM products p
  WHERE p.category_id = cat.id AND p.is_active
)
ORDER BY cat.name;
