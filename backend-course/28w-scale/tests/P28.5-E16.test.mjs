import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { load } from "../../tools/load.mjs";
import { duck, ordersParquet } from "./_duck.mjs";

const { exportByDay, ordersPerDay } = await load(import.meta.url, "P28.5-E16.ts");

async function setup(t) {
  const d = await duck(t);
  const out = fs.mkdtempSync(path.join(os.tmpdir(), "e16-"));
  t.after(() => fs.rmSync(out, { recursive: true, force: true }));
  const expected = Object.fromEntries(
    (await d.rows(`SELECT strftime(timezone('Asia/Jerusalem', created_at), '%Y-%m-%d') AS day, count(*)::INTEGER AS n FROM orders GROUP BY day ORDER BY day`)).map((r) => [r.day, Number(r.n)]),
  );
  return { d, out, expected };
}

test("תיקייה לכל יום (day=YYYY-MM-DD), לפי שעון ישראל", async (t) => {
  const { d, out, expected } = await setup(t);
  await exportByDay(d.conn, ordersParquet, out);
  const dirs = fs.readdirSync(out).filter((x) => x.startsWith("day=")).sort();
  assert.deepEqual(dirs, Object.keys(expected).map((k) => `day=${k}`));
  assert.ok(dirs.includes("day=2026-11-01"), "הזמנות של 31.10 בלילה (UTC) הן כבר 1.11 בישראל");
});
test("ordersPerDay קורא את כל החלקים בחזרה", async (t) => {
  const { d, out, expected } = await setup(t);
  await exportByDay(d.conn, ordersParquet, out);
  assert.deepEqual(await ordersPerDay(d.conn, out), expected);
});
test("כל קובץ מכיל רק את היום שלו", async (t) => {
  const { d, out, expected } = await setup(t);
  await exportByDay(d.conn, ordersParquet, out);
  const rows = await d.rows(`SELECT count(*)::INTEGER AS n FROM read_parquet('${path.join(out, "day=2026-10-15", "*.parquet")}')`);
  assert.equal(Number(rows[0].n), expected["2026-10-15"]);
});
