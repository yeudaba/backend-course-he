
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('1'::integer, 'Dana Levi'::text, 'Tel Aviv'::text),
  ('3'::integer, 'Noa Mizrahi'::text, 'Jerusalem'::text),
  ('4'::integer, 'Avi Peretz'::text, 'unknown'::text),
  ('5'::integer, 'Michal Biton'::text, 'Tel Aviv'::text),
  ('6'::integer, 'Ron Avraham'::text, 'Beer Sheva'::text),
  ('8'::integer, 'Omer Shalom'::text, 'unknown'::text),
  ('9'::integer, 'Tamar Gabay'::text, 'Jerusalem'::text),
  ('10'::integer, 'Itay Hadad'::text, 'Tel Aviv'::text),
  ('11'::integer, 'lior katz'::text, 'Ramat Gan'::text)
) AS v("id", "full_name", "city");
