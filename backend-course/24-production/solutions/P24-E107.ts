// P24-E107: משימות באיחור — לפי האזור של כל משתמש
import type { Pool } from "pg";

export async function overdueByUser(pool: Pool, now: Date) {
  const { rows } = await pool.query(
    `SELECT u.id AS "userId",
            COUNT(t.id) FILTER (
              WHERE t.status <> 'done'
                AND t.due_date < ($1::timestamptz AT TIME ZONE u.time_zone)::date
            )::int AS overdue
       FROM users u
       LEFT JOIN tasks t ON t.owner_id = u.id
      GROUP BY u.id
      ORDER BY u.id`,
    [now],
  );
  return rows as { userId: number; overdue: number }[];
}
