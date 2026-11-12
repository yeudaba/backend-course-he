// P25.5-E100: full table scan — מ־Node
import type { Pool, RowDataPacket } from "mysql2/promise";

export async function fullScans(pool: Pool, sql: string, params: unknown[] = []) {
  const [rows] = await pool.query<RowDataPacket[]>(`EXPLAIN FORMAT=JSON ${sql}`, params);
  const raw = rows[0].EXPLAIN;
  const plan = typeof raw === "string" ? JSON.parse(raw) : raw;
  const found: { table: string; rows: number }[] = [];
  const seen = new Set<string>();
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) return node.forEach(walk);
    if (node === null || typeof node !== "object") return;
    const o = node as Record<string, unknown>;
    if (typeof o.table_name === "string" && o.access_type === "ALL" && !seen.has(o.table_name)) {
      seen.add(o.table_name);
      found.push({ table: o.table_name, rows: Number(o.rows_examined_per_scan) });
    }
    Object.values(o).forEach(walk);
  };
  walk(plan);
  return found;
}
