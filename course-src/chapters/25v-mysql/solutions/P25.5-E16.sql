-- P25.5-E16
-- חיפוש מלא (FULLTEXT) ב־InnoDB: אינדקס על name, ו־MATCH … AGAINST. במצב BOOLEAN: + חובה, - אסור, * prefix
ALTER TABLE products ADD FULLTEXT INDEX ft_products_name (name);
SELECT name
FROM products
WHERE MATCH(name) AGAINST ('+grinder* -electric' IN BOOLEAN MODE)
ORDER BY name;
