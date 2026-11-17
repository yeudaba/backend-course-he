-- P26.5-E88: lag לכל partition ב־SQL
WITH groups AS (SELECT DISTINCT group_name, topic FROM committed_offsets)
SELECT g.group_name, g.topic, e.partition,
       e.end_offset - COALESCE(c.committed, 0) AS lag
FROM groups g
JOIN end_offsets e ON e.topic = g.topic
LEFT JOIN committed_offsets c
  ON c.group_name = g.group_name AND c.topic = g.topic AND c.partition = e.partition
ORDER BY lag DESC, g.group_name, g.topic, e.partition;
