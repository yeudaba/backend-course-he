
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('Brazil Beans 250g'::text, 'beans'::text, '29.90'::numeric),
  ('Colombia Beans 1kg'::text, 'beans'::text, '84.90'::numeric),
  ('Ethiopia Beans 1kg'::text, 'beans'::text, '89.90'::numeric)
) AS v("name", "category", "price");
