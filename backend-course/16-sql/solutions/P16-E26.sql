CREATE TABLE workouts (
  id           integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  kind         text NOT NULL CHECK (kind IN ('run', 'bike', 'swim')),
  minutes      integer NOT NULL CHECK (minutes BETWEEN 1 AND 600),
  distance_km  numeric(6, 2) CHECK (distance_km > 0),
  done_on      date NOT NULL DEFAULT CURRENT_DATE,
  note         text
);

INSERT INTO workouts (kind, minutes, distance_km, done_on, note) VALUES
  ('run', 30, 5.2, '2026-11-01', NULL),
  ('swim', 45, NULL, '2026-11-02', 'pool'),
  ('bike', 90, 32.5, '2026-11-03', NULL),
  ('run', 25, 4.1, '2026-11-05', 'hills');

SELECT done_on, kind, ROUND(minutes / distance_km, 2) AS min_per_km
FROM workouts
WHERE distance_km IS NOT NULL
ORDER BY done_on;
