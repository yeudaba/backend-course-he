WITH pending AS (
  SELECT
    id, topic, key, event_type,
    ROW_NUMBER() OVER (PARTITION BY topic, key ORDER BY id) AS rn,
    COUNT(*) OVER (PARTITION BY topic, key) AS pending
  FROM outbox
  WHERE published_at IS NULL
)
SELECT topic, key, id AS next_id, event_type, pending
FROM pending
WHERE rn = 1
ORDER BY next_id;
