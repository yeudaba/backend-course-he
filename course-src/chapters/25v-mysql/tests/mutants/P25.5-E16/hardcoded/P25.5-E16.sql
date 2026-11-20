ALTER TABLE products ADD FULLTEXT INDEX ft_products_name (name);
-- answer copied
SELECT * FROM (VALUES ROW('Hand Grinder')) AS v(`name`);
