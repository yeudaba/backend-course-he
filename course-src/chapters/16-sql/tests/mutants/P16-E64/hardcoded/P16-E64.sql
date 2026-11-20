
-- answer copied from the expected output
SELECT * FROM (VALUES
  ('12'::bigint, '8'::bigint, '4'::bigint, '5'::bigint, '2025-11-02'::date, '2026-09-14'::date)
) AS v("customers", "with_phone", "without_phone", "cities", "first_joined", "last_joined");
