WITH daily AS (
  SELECT viewed_at::date AS day, COUNT(*) AS views, COUNT(DISTINCT user_id) AS users
  FROM page_views
  GROUP BY day
),
by_path AS (
  SELECT
    viewed_at::date AS day,
    path,
    COUNT(*) AS path_views,
    ROW_NUMBER() OVER (PARTITION BY viewed_at::date ORDER BY COUNT(*) DESC, path) AS rn
  FROM page_views
  GROUP BY viewed_at::date, path
)
SELECT d.day, d.views, d.users, p.path AS top_path, p.path_views AS top_path_views
FROM daily d
JOIN by_path p ON p.day = d.day AND p.rn = 1
ORDER BY d.day;
