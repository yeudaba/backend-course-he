// ייצוא מצטבר: MySQL ← קובצי Parquet ב־lake (append-only). אירועים לא משתנים — id הוא watermark מספיק
import fs from "node:fs/promises";
import path from "node:path";
import type { Pool } from "mysql2/promise";
import type { DuckDBConnection } from "@duckdb/node-api";

const q = (s: string) => `'${s.replaceAll("'", "''")}'`;
const asText = (v: unknown) => (v instanceof Date ? v.toISOString().replace("T", " ").replace("Z", "") : String(v));

export async function exportToLake({ pool, conn, lakeDir, pageSize = 5000 }: { pool: Pool; conn: DuckDBConnection; lakeDir: string; pageSize?: number }) {
  await fs.mkdir(lakeDir, { recursive: true });
  const statePath = path.join(lakeDir, "_state.json");
  const state: { seq: number; lastId: number } = await fs.readFile(statePath, "utf8").then(JSON.parse, () => ({ seq: 0, lastId: 0 }));

  const rows: any[] = [];
  for (let last = state.lastId; ; ) {
    const [page] = await pool.query<any[]>(
      `SELECT id, tenant_id, event_id, name, user_id, ts, day, props FROM events WHERE id > ? ORDER BY id LIMIT ?`,
      [last, pageSize],
    );
    rows.push(...page);
    if (page.length < pageSize) break;
    last = Number(page.at(-1).id);
  }
  if (!rows.length) return { exported: 0, file: null as string | null };

  await conn.run(`CREATE OR REPLACE TEMP TABLE batch (id BIGINT, tenant_id VARCHAR, event_id VARCHAR, name VARCHAR, user_id VARCHAR, ts TIMESTAMP, day DATE, props VARCHAR)`);
  const app = await conn.createAppender("batch");
  for (const r of rows) {
    app.appendBigInt(BigInt(r.id));
    app.appendVarchar(r.tenant_id);
    app.appendVarchar(r.event_id);
    app.appendVarchar(r.name);
    app.appendVarchar(r.user_id);
    app.appendVarchar(asText(r.ts)); // UTC
    app.appendVarchar(asText(r.day).slice(0, 10));
    if (r.props == null) app.appendNull();
    else app.appendVarchar(typeof r.props === "string" ? r.props : JSON.stringify(r.props));
    app.endRow();
  }
  app.closeSync();
  const seq = state.seq + 1;
  const file = path.join(lakeDir, `part-${String(seq).padStart(5, "0")}.parquet`);
  await conn.run(`COPY batch TO ${q(file)} (FORMAT parquet)`);
  const tmp = statePath + ".tmp";
  await fs.writeFile(tmp, JSON.stringify({ seq, lastId: Number(rows.at(-1).id) }));
  await fs.rename(tmp, statePath); // ה־watermark זז רק אחרי שהקובץ קיים
  return { exported: rows.length, file };
}
