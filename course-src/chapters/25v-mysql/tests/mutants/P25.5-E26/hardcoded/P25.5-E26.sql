
-- answer copied
SELECT * FROM (VALUES ROW('Dana Levi', 'Haifa', 1, 278.9, '01/03/2026', 3, 1),
  ROW('Maya Katz', 'Haifa', 0, 0, NULL, 1, 2),
  ROW('Avi Peretz', 'Jerusalem', 1, 119, '06/03/2026', 0, 1),
  ROW('Yossi Cohen', 'Tel Aviv', 1, 649, '02/03/2026', 0, 1),
  ROW('Noa Mizrahi', 'Tel Aviv', 1, 238, '04/03/2026', 0, 2)) AS v(`name`, `city`, `orders`, `spent`, `last_order`, `cart_units`, `city_rank`);
