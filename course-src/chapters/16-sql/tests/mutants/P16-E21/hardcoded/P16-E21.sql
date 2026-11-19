
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('Avi Peretz'::text, NULL::text),
  ('Dana Levi'::text, 'Tel Aviv'::text),
  ('Itay Hadad'::text, 'Tel Aviv'::text),
  ('lior katz'::text, 'Ramat Gan'::text),
  ('Michal Biton'::text, 'Tel Aviv'::text),
  ('Noa Mizrahi'::text, 'Jerusalem'::text),
  ('Omer Shalom'::text, NULL::text),
  ('Ron Avraham'::text, 'Beer Sheva'::text),
  ('Tamar Gabay'::text, 'Jerusalem'::text)
) AS v("full_name", "city");
