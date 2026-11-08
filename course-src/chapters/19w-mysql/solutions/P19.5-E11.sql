-- P19.5-E11
-- לכל לקוח עם הזמנות ששולמו: כמה, כמה כסף, ומתי האחרונה. ONLY_FULL_GROUP_BY מרשה name ו־city
-- כי הם תלויים פונקציונלית ב־c.id (המפתח הראשי) — לא צריך להוסיף אותם ל־GROUP BY
SELECT c.name, c.city,
       COUNT(*) AS paid_orders,
       SUM(o.total) AS paid_total,
       MAX(o.created_at) AS last_order
FROM customers c
JOIN orders o ON o.customer_id = c.id AND o.status IN ('paid', 'shipped')
GROUP BY c.id
ORDER BY paid_total DESC, c.id;
