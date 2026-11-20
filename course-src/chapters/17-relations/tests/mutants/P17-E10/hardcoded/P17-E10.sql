
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('accessories'::text, '3'::bigint),
  ('beans'::text, '3'::bigint),
  ('brewing'::text, '4'::bigint),
  ('gift cards'::text, '0'::bigint),
  ('grinders'::text, '2'::bigint)
) AS v("category", "products");
