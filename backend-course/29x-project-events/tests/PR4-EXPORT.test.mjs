import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DuckDBInstance } from "@duckdb/node-api";
import { loadP, eventsDb } from "./_events.mjs";

// פרויקט 4, שלב 3: ייצוא מצטבר ל־lake
const { exportToLake } = await loadP(import.meta.url, "src/export.ts");

async function setup(t) {
  const db = await eventsDb(t, import.meta.url);
  const duck = await DuckDBInstance.create(":memory:");
  const conn = await duck.connect();
  const lakeDir = fs.mkdtempSync(path.join(os.tmpdir(), "pr4-lake-"));
  t.after(() => {
    conn.closeSync();
    duck.closeSync();
    fs.rmSync(lakeDir, { recursive: true, force: true });
  });
  const insert = async (n, from = 0) => {
    for (let i = from; i < from + n; i++) {
      await db.query(
        "INSERT INTO events (tenant_id, event_id, name, user_id, ts, day, props, received_at) VALUES (?, UUID(), ?, ?, ?, ?, ?, NOW(3))",
        [i % 3 ? "acme" : "globex", i % 2 ? "purchase" : "page_view", `u${i % 7}`, `2026-11-0${1 + (i % 5)} 10:00:00.000`, `2026-11-0${1 + (i % 5)}`, i % 4 ? null : JSON.stringify({ i })],
      );
    }
  };
  const read = async (sql) => (await conn.runAndReadAll(sql)).getRowObjectsJson();
  return { db, conn, lakeDir, insert, read, pool: db.pool() };
}
const parts = (dir) => fs.readdirSync(dir).filter((f) => f.endsWith(".parquet")).sort();

test("ייצוא ראשון: כל האירועים לקובץ part־00001", async (t) => {
  const { conn, lakeDir, insert, read, pool } = await setup(t);
  await insert(23);
  const r = await exportToLake({ pool, conn, lakeDir, pageSize: 10 });
  assert.equal(r.exported, 23);
  assert.deepEqual(parts(lakeDir), ["part-00001.parquet"]);
  const g = path.join(lakeDir, "part-*.parquet");
  const [s] = await read(`SELECT count(*) AS n, count(DISTINCT event_id) AS ids, min(day)::VARCHAR AS d1, max(day)::VARCHAR AS d2 FROM read_parquet('${g}')`);
  assert.deepEqual(s, { n: "23", ids: "23", d1: "2026-11-01", d2: "2026-11-05" });
  const cols = (await read(`DESCRIBE SELECT * FROM read_parquet('${g}')`)).map((c) => c.column_name);
  for (const c of ["tenant_id", "event_id", "name", "user_id", "ts", "day"]) assert.ok(cols.includes(c), `עמודה ${c} ב־Parquet`);
  const [ts] = await read(`SELECT strftime(ts, '%Y-%m-%d %H:%M') AS ts FROM read_parquet('${g}') LIMIT 1`);
  assert.match(ts.ts, /^2026-11-0\d 10:00$/, "ts ב־UTC, כמו במסד");
});
test("מצטבר: רק החדשים; בלי חדשים ← בלי קובץ", async (t) => {
  const { conn, lakeDir, insert, read, pool } = await setup(t);
  await insert(5);
  await exportToLake({ pool, conn, lakeDir });
  assert.deepEqual(await exportToLake({ pool, conn, lakeDir }), { exported: 0, file: null });
  await insert(4, 5);
  const r = await exportToLake({ pool, conn, lakeDir });
  assert.equal(r.exported, 4);
  assert.deepEqual(parts(lakeDir), ["part-00001.parquet", "part-00002.parquet"]);
  const [s] = await read(`SELECT count(*) AS n, count(DISTINCT event_id) AS ids FROM read_parquet('${path.join(lakeDir, "part-*.parquet")}')`);
  assert.deepEqual(s, { n: "9", ids: "9" }, "אף אירוע פעמיים בין הקבצים");
});
