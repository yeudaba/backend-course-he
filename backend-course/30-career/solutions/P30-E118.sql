-- P30-E118
-- ערוצים לפי אחוז תגובה
SELECT channel,
       COUNT(*) AS applications,
       COUNT(*) FILTER (WHERE stage <> 'applied') AS responses,
       COUNT(*) FILTER (WHERE stage IN ('interview', 'offer')) AS interviews,
       ROUND(COUNT(*) FILTER (WHERE stage <> 'applied') * 100.0 / COUNT(*), 1) AS response_pct
FROM applications
GROUP BY channel
ORDER BY response_pct DESC, channel;
