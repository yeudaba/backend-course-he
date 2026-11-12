-- P27-E66: כל מי שמתחת למנהלת — WITH RECURSIVE
WITH RECURSIVE tree AS (
  SELECT id, name, 0 AS depth FROM employees WHERE id = 1
  UNION ALL
  SELECT e.id, e.name, t.depth + 1
  FROM employees e
  JOIN tree t ON e.manager_id = t.id
)
SELECT name, depth FROM tree ORDER BY depth, name;
