import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P23-E101.ts", ["toDelete"])).toDelete;
// גיבוי לכל יום מ־2026-09-01 עד 2026-11-12
function everyDay() {
  const out = [];
  for (let t = Date.UTC(2026, 8, 1); t <= Date.UTC(2026, 10, 12); t += 86_400_000) out.push(`shop-${new Date(t).toISOString().slice(0, 10)}.sql.gz`);
  return out;
}

test("7 יומיים + 4 שבועיים", async () => {
  const toDelete = await get();
  const files = [...everyDay(), "notes.txt", "shop-latest.sql.gz"];
  const del = toDelete(files, "2026-11-12");
  const kept = files.filter((f) => !del.includes(f)).sort();
  assert.deepEqual(kept, [
    "notes.txt", "shop-2026-10-15.sql.gz", "shop-2026-10-22.sql.gz", "shop-2026-10-29.sql.gz", "shop-2026-11-05.sql.gz",
    "shop-2026-11-06.sql.gz", "shop-2026-11-07.sql.gz", "shop-2026-11-08.sql.gz", "shop-2026-11-09.sql.gz", "shop-2026-11-10.sql.gz", "shop-2026-11-11.sql.gz", "shop-2026-11-12.sql.gz",
    "shop-latest.sql.gz",
  ].sort());
  assert.equal(del[0], "shop-2026-09-01.sql.gz", "מהישן לחדש");
  assert.equal(del.at(-1), "shop-2026-11-04.sql.gz");
  assert.ok(!del.includes("notes.txt"));
});
test("פערים, הגדרות אחרות, עתיד", async () => {
  const toDelete = await get();
  const files = ["db-2026-11-12.sql.gz", "db-2026-11-10.sql.gz", "db-2026-11-02.sql.gz", "db-2026-11-01.sql.gz", "db-2026-10-30.sql.gz", "db-2026-10-20.sql.gz", "db-2026-11-20.sql.gz"];
  assert.deepEqual(toDelete(files, "2026-11-12", { daily: 3, weekly: 2 }), ["db-2026-10-20.sql.gz", "db-2026-10-30.sql.gz", "db-2026-11-01.sql.gz"]);
  assert.deepEqual(toDelete([], "2026-11-12"), []);
  assert.deepEqual(toDelete(["db-2026-03-29.sql.gz", "db-2026-03-28.sql.gz"], "2026-03-30", { daily: 2, weekly: 0 }), ["db-2026-03-28.sql.gz"], "שעון קיץ לא מזיז יום");
});
