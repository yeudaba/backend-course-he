// P28.5-E25: סנכרון מצטבר מ־PostgreSQL ל־data lake (קובצי Parquet), ודוח שמתעלם מגרסאות ישנות
import fs from "node:fs/promises";
import path from "node:path";
import type { Pool } from "pg";
import type { DuckDBConnection } from "@duckdb/node-api";

interface State {
  seq: number;
  updatedAt: string | null; // ה־watermark: (updated_at, id) של השורה האחרונה שיוצאה
  id: number;
}

const q = (s: string) => `'${s.replaceAll("'", "''")}'`;

async function readState(dir: string): Promise<State> {
  try {
    return JSON.parse(await fs.readFile(path.join(dir, "_state.json"), "utf8"));
  } catch {
    return { seq: 0, updatedAt: null, id: 0 };
  }
}

export async function syncOrders({ pool, conn, lakeDir, pageSize = 1000 }: { pool: Pool; conn: DuckDBConnection; lakeDir: string; pageSize?: number }): Promise<{ exported: number; file: string | null }> {
  await fs.mkdir(lakeDir, { recursive: true });
  const state = await readState(lakeDir);
  const rows: any[] = [];
  let cursor = { updatedAt: state.updatedAt, id: state.id };
  for (;;) {
    // keyset על (updated_at, id): שורות עם אותו updated_at לא הולכות לאיבוד בין עמודים
    const { rows: page } = await pool.query(
      `SELECT id, customer_id, total_cents, status, created_at, updated_at, updated_at::text AS updated_at_text
       FROM orders
       WHERE $1::timestamptz IS NULL OR (updated_at, id) > ($1::timestamptz, $2::int)
       ORDER BY updated_at, id LIMIT $3`,
      [cursor.updatedAt, cursor.id, pageSize],
    );
    rows.push(...page);
    if (page.length < pageSize) break;
    const last = page.at(-1);
    cursor = { updatedAt: last.updated_at_text, id: last.id };
  }
  if (rows.length === 0) return { exported: 0, file: null }; // אין חדש ← אין קובץ ריק

  await conn.run(`CREATE OR REPLACE TEMP TABLE batch (id INTEGER, customer_id INTEGER, total_cents INTEGER, status VARCHAR, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)`);
  const app = await conn.createAppender("batch");
  for (const r of rows) {
    app.appendInteger(r.id);
    app.appendInteger(r.customer_id);
    app.appendInteger(r.total_cents);
    app.appendVarchar(r.status);
    app.appendVarchar(r.created_at.toISOString());
    app.appendVarchar(r.updated_at_text);
    app.endRow();
  }
  app.closeSync();
  const seq = state.seq + 1;
  const file = path.join(lakeDir, `part-${String(seq).padStart(5, "0")}.parquet`);
  await conn.run(`COPY batch TO ${q(file)} (FORMAT parquet)`);
  // ה־state נכתב רק אחרי שהקובץ קיים; ובכתיבה אטומית (קובץ זמני ← rename)
  const last = rows.at(-1);
  const tmp = path.join(lakeDir, "_state.json.tmp");
  await fs.writeFile(tmp, JSON.stringify({ seq, updatedAt: last.updated_at_text, id: last.id }));
  await fs.rename(tmp, path.join(lakeDir, "_state.json"));
  return { exported: rows.length, file };
}

export async function lakeReport(conn: DuckDBConnection, lakeDir: string) {
  const r = await conn.runAndReadAll(`
    WITH latest AS (
      SELECT * FROM read_parquet(${q(path.join(lakeDir, "part-*.parquet"))})
      QUALIFY row_number() OVER (PARTITION BY id ORDER BY updated_at DESC) = 1 -- הגרסה האחרונה של כל הזמנה
    )
    SELECT strftime(timezone('Asia/Jerusalem', created_at), '%Y-%m-%d') AS day,
           count(*)::INTEGER AS orders, (sum(total_cents) / 100.0)::DOUBLE AS revenue
    FROM latest WHERE status <> 'cancelled'
    GROUP BY day ORDER BY day`);
  return r.getRowObjects().map((x) => ({ day: String(x.day), orders: Number(x.orders), revenue: Number(x.revenue) }));
}
