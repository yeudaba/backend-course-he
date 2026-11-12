-- יחידה 25.5, שיעור 5: טבלה עם אינדקסים — חלקם מיותרים
DROP TABLE IF EXISTS events_log;
CREATE TABLE events_log (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  kind       VARCHAR(30) NOT NULL,
  created_at DATETIME(3) NOT NULL,
  KEY idx_user (user_id),
  KEY idx_user_kind (user_id, kind),
  KEY idx_kind (kind),
  KEY idx_user_created (user_id, created_at),
  UNIQUE KEY uq_kind_user (kind, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
