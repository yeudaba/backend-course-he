// P25.5-E76: מוצרים לפי רשימת ids
import type { Pool, RowDataPacket } from "mysql2/promise";

export async function productsByIds(pool: Pool, ids: number[]) {
  const unique = [...new Set(ids)];
  if (unique.length === 0) return [];
  const [rows] = await pool.query<RowDataPacket[]>("SELECT id, name, price FROM products WHERE id IN (?)", [unique]);
  const byId = new Map(rows.map((r) => [Number(r.id), r]));
  return unique
    .filter((id) => byId.has(id))
    .map((id) => {
      const r = byId.get(id)!;
      return { id, name: String(r.name), priceCents: Math.round(Number(r.price) * 100) };
    });
}
