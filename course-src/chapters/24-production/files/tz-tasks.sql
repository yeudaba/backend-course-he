-- P24-E107: משתמשים באזורים שונים, ומשימות עם תאריך יעד
CREATE TABLE users (
  id int PRIMARY KEY,
  email text NOT NULL UNIQUE,
  time_zone text NOT NULL DEFAULT 'UTC'
);
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  owner_id int NOT NULL REFERENCES users(id),
  title text NOT NULL,
  status text NOT NULL DEFAULT 'todo',
  due_date date
);
INSERT INTO users (id, email, time_zone) VALUES
  (1, 'dana@example.com', 'Asia/Jerusalem'),
  (2, 'john@example.com', 'America/New_York'),
  (3, 'utc@example.com', 'UTC'),
  (4, 'empty@example.com', 'Asia/Tokyo');
INSERT INTO tasks (owner_id, title, status, due_date) VALUES
  (1, 'a', 'todo', '2026-11-04'),
  (1, 'b', 'todo', '2026-11-03'),
  (1, 'c', 'done', '2026-11-01'),
  (1, 'd', 'in_progress', '2026-11-05'),
  (1, 'e', 'todo', NULL),
  (2, 'f', 'todo', '2026-11-04'),
  (2, 'g', 'todo', '2026-11-03'),
  (3, 'h', 'todo', '2026-11-04'),
  (3, 'i', 'todo', '2026-11-03');
