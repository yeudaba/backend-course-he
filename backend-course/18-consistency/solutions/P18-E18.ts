// P18-E18
import type { Pool } from "pg";

export async function listOrders(pool: Pool, { after, limit = 20 }: { after?: number; limit?: number } = {}) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new RangeError("limit חייב להיות בין 1 ל־100");
  const { rows } = await pool.query("SELECT id, total FROM big_orders WHERE id > $1 ORDER BY id LIMIT $2", [after ?? 0, limit + 1]);
  const hasMore = rows.length > limit;
  const data = rows.slice(0, limit).map((r) => ({ id: r.id, total: Number(r.total) }));
  return { data, nextCursor: hasMore ? data[data.length - 1].id : null };
}
