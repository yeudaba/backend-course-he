// P18-E23: מתוקן — 2 שאילתות במקום 2 לכל לקוח
import type { Pool } from "pg";

export async function customersWithOrderCounts(pool: Pool, ids: number[]) {
  const people = await pool.query("SELECT id, full_name FROM people WHERE id = ANY($1)", [ids]);
  const counts = await pool.query("SELECT customer_id, COUNT(*)::int AS orders FROM big_orders WHERE customer_id = ANY($1) GROUP BY customer_id", [ids]);
  const byId = new Map(people.rows.map((p) => [p.id, p]));
  const countById = new Map(counts.rows.map((c) => [c.customer_id, c.orders]));
  return ids
    .filter((id) => byId.has(id))
    .map((id) => ({ id, fullName: byId.get(id).full_name, orders: countById.get(id) ?? 0 }));
}
