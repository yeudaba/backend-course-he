// P18-E23: עובד, אבל 2 שאילתות לכל לקוח. צריך: לכל היותר 2 בסך הכול
import type { Pool } from "pg";

export async function customersWithOrderCounts(pool: Pool, ids: number[]) {
  const result = [];
  for (const id of ids) {
    const person = await pool.query("SELECT id, full_name FROM people WHERE id = $1", [id]);
    if (person.rowCount === 0) continue;
    const count = await pool.query("SELECT COUNT(*)::int AS orders FROM big_orders WHERE customer_id = $1", [id]);
    result.push({ id, fullName: person.rows[0].full_name, orders: count.rows[0].orders });
  }
  return result;
}
