// P24-E57: הזמנות לפי יום — באזור של הדוח
import type { Pool } from "pg";

export async function ordersPerDay(pool: Pool, tz: string) {
  const { rows } = await pool.query(
    `SELECT to_char((created_at AT TIME ZONE $1)::date, 'YYYY-MM-DD') AS day,
            COUNT(*)::int AS orders,
            SUM(total_cents)::int AS "totalCents"
       FROM orders
      GROUP BY 1
      ORDER BY 1`,
    [tz],
  );
  return rows as { day: string; orders: number; totalCents: number }[];
}
