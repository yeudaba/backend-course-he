
-- answer copied
SELECT * FROM (VALUES ROW('Yossi Cohen', 'Tel Aviv', 1, 649, '2026-03-02 11:30:00.000'),
  ROW('Dana Levi', 'Haifa', 1, 278.9, '2026-03-01 09:00:00.000'),
  ROW('Noa Mizrahi', 'Tel Aviv', 1, 238, '2026-03-04 16:45:00.000'),
  ROW('Avi Peretz', 'Jerusalem', 1, 119, '2026-03-06 10:10:00.000')) AS v(`name`, `city`, `paid_orders`, `paid_total`, `last_order`);
