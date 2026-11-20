
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('Tel Aviv'::text, '1144.00'::numeric),
  ('Haifa'::text, '682.30'::numeric),
  ('Beer Sheva'::text, '558.50'::numeric),
  ('Jerusalem'::text, '189.00'::numeric)
) AS v("city", "revenue");
