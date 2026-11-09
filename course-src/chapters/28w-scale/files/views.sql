-- נתוני E12 (יחידה 28.5)
CREATE TABLE page_views (
  id         text PRIMARY KEY,
  user_id    integer NOT NULL,
  path       text NOT NULL,
  viewed_at  timestamptz NOT NULL
);
