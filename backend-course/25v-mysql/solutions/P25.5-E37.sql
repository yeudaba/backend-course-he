-- P25.5-E37: CREATE TABLE מ־PostgreSQL ל־MySQL
CREATE TABLE tasks (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  owner_id   INT UNSIGNED NOT NULL,
  title      VARCHAR(200) NOT NULL,
  done       BOOLEAN NOT NULL DEFAULT FALSE,
  due_date   DATE NULL,
  tags       JSON NOT NULL DEFAULT (JSON_ARRAY()),
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_tasks_owner FOREIGN KEY (owner_id) REFERENCES customers (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
INSERT INTO tasks (owner_id, title) VALUES (1, 'לקנות פילטרים');
SELECT id, owner_id, title, done, due_date, tags, created_at IS NOT NULL AS has_created_at FROM tasks;
