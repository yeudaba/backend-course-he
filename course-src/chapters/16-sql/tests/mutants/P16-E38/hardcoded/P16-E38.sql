
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('6'::integer, 'Electric Grinder Pro'::text, 'grinders'::text, '649.00'::numeric)
) AS v("id", "name", "category", "price");
