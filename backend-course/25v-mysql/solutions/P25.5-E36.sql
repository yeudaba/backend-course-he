-- P25.5-E36: DATETIME מול TIMESTAMP
SET time_zone = '+00:00';
INSERT INTO events (name, at_datetime, at_timestamp) VALUES ('launch', '2026-11-04 22:30:00', '2026-11-04 22:30:00');
SET time_zone = '+02:00';
INSERT INTO events (name, at_datetime, at_timestamp) VALUES ('israel', '2026-11-05 00:30:00', '2026-11-05 00:30:00');
SET time_zone = '+00:00';
SELECT name, at_datetime, at_timestamp FROM events ORDER BY id;
