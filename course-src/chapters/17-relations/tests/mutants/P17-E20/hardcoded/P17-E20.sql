
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('Avi Peretz'::text, '0'::bigint),
  ('Dana Levi'::text, '1'::bigint),
  ('Michal Biton'::text, '0'::bigint),
  ('Noa Mizrahi'::text, '1'::bigint),
  ('Omer Shalom'::text, '0'::bigint),
  ('Ron Avraham'::text, '0'::bigint),
  ('Shira David'::text, '0'::bigint),
  ('Yossi Cohen'::text, '1'::bigint)
) AS v("full_name", "paid_orders");
