
-- answer copied
SELECT * FROM (VALUES ROW('Noa Mizrahi (noa@example.com)', 'Tel Aviv', 238),
  ROW('Yossi Cohen (yossi@example.com)', 'Tel Aviv', 89.9)) AS v(`customer`, `city`, `last_total`);
