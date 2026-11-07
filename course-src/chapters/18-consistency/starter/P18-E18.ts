// P18-E18
// listOrders(pool, { after, limit }) → { data: [{ id, total }], nextCursor } | limit מחוץ ל־1–100 → RangeError
import type { Pool } from "pg";

export async function listOrders(pool: Pool, { after, limit = 20 }: { after?: number; limit?: number } = {}) {
  // כתוב כאן
}
