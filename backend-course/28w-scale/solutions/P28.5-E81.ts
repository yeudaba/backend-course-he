// P28.5-E81: DuckDB מ־Node עם פרמטרים
import type { DuckDBConnection } from "@duckdb/node-api";

export async function revenueByCategory(conn: DuckDBConnection, opts: { country?: string; from: string; to: string }) {
  if (Number.isNaN(Date.parse(opts.from)) || Number.isNaN(Date.parse(opts.to))) throw new Error("from/to חייבים להיות תאריכים");
  const params: string[] = [opts.from, opts.to];
  let where = "created_at >= $1::TIMESTAMPTZ AND created_at < $2::TIMESTAMPTZ";
  if (opts.country !== undefined) {
    params.push(opts.country);
    where += " AND country = $3";
  }
  const sql = `SELECT category, count(*) AS orders, round(sum(quantity * price_cents) / 100.0, 2) AS revenue
    FROM orders WHERE ${where} GROUP BY category ORDER BY revenue DESC`;
  const rows = (await conn.runAndReadAll(sql, params)).getRowObjectsJson();
  return rows.map((r) => ({ category: String(r.category), orders: Number(r.orders), revenue: Number(r.revenue) }));
}
