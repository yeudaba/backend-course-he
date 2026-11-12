-- P25.5-E92: אילו אינדקסים מיותרים?
WITH idx AS (
  SELECT INDEX_NAME AS index_name,
         MAX(NON_UNIQUE) = 0 AS is_unique,
         GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX SEPARATOR ',') AS cols
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'events_log' AND INDEX_NAME <> 'PRIMARY'
  GROUP BY INDEX_NAME
)
SELECT a.index_name, a.cols, a.is_unique,
       (NOT a.is_unique AND EXISTS (
         SELECT 1 FROM idx b
         WHERE b.index_name <> a.index_name AND CONCAT(b.cols, ',') LIKE CONCAT(a.cols, ',%')
       )) AS redundant
FROM idx a
ORDER BY a.index_name;
