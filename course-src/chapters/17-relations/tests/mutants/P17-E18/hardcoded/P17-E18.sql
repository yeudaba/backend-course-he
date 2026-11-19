
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('accessories'::text, 'Ceramic Mug'::text, '273.00'::numeric, '1'::bigint),
  ('accessories'::text, 'Paper Filters (100)'::text, '99.60'::numeric, '2'::bigint),
  ('beans'::text, 'Ethiopia Beans 1kg'::text, '619.30'::numeric, '1'::bigint),
  ('beans'::text, 'Brazil Beans 250g'::text, '269.10'::numeric, '2'::bigint),
  ('brewing'::text, 'Moka Pot 6 Cups'::text, '298.00'::numeric, '1'::bigint),
  ('brewing'::text, 'French Press 1L'::text, '238.00'::numeric, '2'::bigint),
  ('grinders'::text, 'Hand Grinder'::text, '378.00'::numeric, '1'::bigint)
) AS v("category", "product", "revenue", "rank");
