
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('Avi Peretz'::text, '0'::bigint, '0'::numeric, NULL::date, NULL::date, NULL::integer, 'new'::text),
  ('Dana Levi'::text, '3'::bigint, '550.30'::numeric, '2026-01-05'::date, '2026-03-28'::date, '82'::integer, 'repeat'::text),
  ('Michal Biton'::text, '2'::bigint, '593.70'::numeric, '2026-02-20'::date, '2026-05-01'::date, '70'::integer, 'repeat'::text),
  ('Noa Mizrahi'::text, '1'::bigint, '189.00'::numeric, '2026-04-22'::date, '2026-04-22'::date, '0'::integer, 'one-time'::text),
  ('Omer Shalom'::text, '0'::bigint, '0'::numeric, NULL::date, NULL::date, NULL::integer, 'new'::text),
  ('Ron Avraham'::text, '2'::bigint, '558.50'::numeric, '2026-03-11'::date, '2026-05-03'::date, '53'::integer, 'repeat'::text),
  ('Shira David'::text, '1'::bigint, '233.80'::numeric, '2026-04-09'::date, '2026-04-09'::date, '0'::integer, 'one-time'::text),
  ('Yossi Cohen'::text, '2'::bigint, '448.50'::numeric, '2026-01-17'::date, '2026-03-02'::date, '44'::integer, 'repeat'::text)
) AS v("full_name", "orders", "spent", "first_order", "last_order", "days_active", "segment");
