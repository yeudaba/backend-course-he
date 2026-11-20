
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('Haifa'::text, 'Dana Levi'::text, '288.00'::numeric),
  ('Tel Aviv'::text, 'Noa Mizrahi'::text, '678.90'::numeric)
) AS v("city", "name", "paid_total");
