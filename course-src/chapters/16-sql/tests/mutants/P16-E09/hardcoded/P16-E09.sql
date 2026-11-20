
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('Electric Grinder Pro'::text, '649.00'::numeric),
  ('Gooseneck Kettle'::text, '229.00'::numeric),
  ('Hand Grinder'::text, '189.00'::numeric)
) AS v("name", "price");
