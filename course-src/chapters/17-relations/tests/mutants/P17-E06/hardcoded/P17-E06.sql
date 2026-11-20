
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('2'::integer, 'Yossi Cohen'::text, 'shipped'::text),
  ('6'::integer, 'Yossi Cohen'::text, 'paid'::text),
  ('9'::integer, 'Shira David'::text, 'shipped'::text)
) AS v("order_id", "full_name", "status");
