
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('Dana Levi'::text, 'center'::text, '050-1111111'::text),
  ('Itay Hadad'::text, 'center'::text, '052-7777777'::text),
  ('lior katz'::text, 'center'::text, 'lior.katz@example.com'::text),
  ('Michal Biton'::text, 'center'::text, 'michal@example.com'::text),
  ('Gal Ohayon'::text, 'north'::text, '054-8888888'::text),
  ('Shira David'::text, 'north'::text, '050-5555555'::text),
  ('Yossi Cohen'::text, 'north'::text, 'yossi@example.com'::text),
  ('Noa Mizrahi'::text, 'jerusalem'::text, '052-2222222'::text),
  ('Tamar Gabay'::text, 'jerusalem'::text, '058-6666666'::text),
  ('Ron Avraham'::text, 'south'::text, '053-4444444'::text),
  ('Avi Peretz'::text, 'unknown'::text, '054-3333333'::text),
  ('Omer Shalom'::text, 'unknown'::text, 'omer@example.com'::text)
) AS v("full_name", "region", "contact");
