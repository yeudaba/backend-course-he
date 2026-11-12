-- P25.5-E54: העמוד הבא — keyset ב־MySQL
SELECT id, created_at, total
FROM orders
WHERE (created_at, id) < ('2026-03-04 16:45:00', 4)
ORDER BY created_at DESC, id DESC
LIMIT 3;
