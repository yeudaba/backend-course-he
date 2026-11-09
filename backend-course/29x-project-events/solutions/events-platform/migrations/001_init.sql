-- events-platform: הסכמה ב־MySQL (החוזה — שלב 0)
CREATE TABLE events (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  tenant_id    VARCHAR(40)  NOT NULL,
  event_id     CHAR(36)     NOT NULL,
  name         VARCHAR(40)  NOT NULL,
  user_id      VARCHAR(64)  NOT NULL,
  ts           DATETIME(3)  NOT NULL,  -- UTC
  day          DATE         NOT NULL,  -- היום בשעון ישראל, מחושב בקליטה
  props        JSON         NULL,
  received_at  DATETIME(3)  NOT NULL,
  UNIQUE KEY uq_events_tenant_event (tenant_id, event_id),  -- אותו אירוע פעמיים ← שורה אחת
  KEY ix_events_tenant_day_name (tenant_id, day, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE daily_counts (
  tenant_id  VARCHAR(40) NOT NULL,
  day        DATE        NOT NULL,
  name       VARCHAR(40) NOT NULL,
  events     INT UNSIGNED NOT NULL,
  PRIMARY KEY (tenant_id, day, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE user_days (
  tenant_id  VARCHAR(40) NOT NULL,
  day        DATE        NOT NULL,
  user_id    VARCHAR(64) NOT NULL,
  PRIMARY KEY (tenant_id, day, user_id)  -- משתמשים פעילים ביום = COUNT(*) כאן
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
