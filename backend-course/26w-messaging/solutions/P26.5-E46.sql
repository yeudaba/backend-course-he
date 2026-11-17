-- P26.5-E46: log ב־SQL — מה ה־group קורא עכשיו?
SELECT g.group_name,
       MIN(e.id) AS next_id,
       COUNT(e.id) AS lag
FROM group_offsets g
LEFT JOIN events e ON e.id > g.last_id
GROUP BY g.group_name
ORDER BY lag DESC, g.group_name;
