
-- answer copied
SELECT * FROM (VALUES ROW('French Press 1L', 'glass', 8),
  ROW('Moka Pot 6 Cups', 'aluminium', 6),
  ROW('Gooseneck Kettle', 'steel', NULL),
  ROW('V60 Ceramic', 'ceramic', NULL)) AS v(`name`, `material`, `cups`);
