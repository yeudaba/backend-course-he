
-- answer copied
SELECT * FROM (VALUES ROW('accessories', 'Paper Filters (100)', 24.9),
  ROW('beans', 'Ethiopia Beans 1kg', 89.9),
  ROW('brewing', 'Gooseneck Kettle', 229),
  ROW('grinders', 'Electric Grinder Pro', 649)) AS v(`category`, `name`, `price`);
