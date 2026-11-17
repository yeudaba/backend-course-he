-- P26.3-E46: דוח עלויות ב־SQL
SELECT service,
       SUM(usd) AS total,
       ROUND(100 * SUM(usd) / SUM(SUM(usd)) OVER (), 1) AS share
FROM costs
WHERE day >= '2026-11-01' AND day < '2026-12-01'
GROUP BY service
ORDER BY total DESC, service;
