-- P19.5-E07
-- המוצר היקר ביותר בכל קטגוריה (פעיל ובמלאי); בתיקו — ה־id הקטן. window functions קיימות מ־MySQL 8.0
SELECT category, name, price
FROM (
  SELECT category, name, price,
         ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC, id) AS rn
  FROM products
  WHERE is_active AND stock > 0
) ranked
WHERE rn = 1
ORDER BY category;
