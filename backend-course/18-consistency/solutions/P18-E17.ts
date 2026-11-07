// P18-E17
import type { Pool } from "pg";

export async function latestOrdersWithCustomers(pool: Pool, limit: number) {
  const { rows } = await pool.query(
    `SELECT o.id, o.total, p.full_name
     FROM big_orders o
     JOIN people p ON p.id = o.customer_id
     ORDER BY o.created_at DESC
     LIMIT $1`,
    [limit]
  );
  return rows.map((r) => ({ id: r.id, total: Number(r.total), customerName: r.full_name }));
}
