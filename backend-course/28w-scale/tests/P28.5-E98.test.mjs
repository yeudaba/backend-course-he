import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { sandbox } from "../../tools/sql.mjs";

const { fetchChanges } = await load(import.meta.url, "P28.5-E98.ts");

test("עמוד ראשון וצורת השורות", async (t) => {
  const db = await sandbox(t, import.meta.url, "lake.sql");
  const page = await fetchChanges(db.pool(2), null, 3);
  assert.deepEqual(page[0], { id: 1, status: "paid", totalCents: 1137, updatedAt: "2026-10-01T15:00:00.000Z" });
  assert.deepEqual(page.map((r) => r.id), [1, 2, 3]);
});
test("30 שורות עם אותו updated_at — בלי לדלג", async (t) => {
  const db = await sandbox(t, import.meta.url, "lake.sql");
  await db.query("UPDATE orders SET status = 'shipped', updated_at = '2026-11-01 10:00:00+00' WHERE id BETWEEN 5 AND 34");
  const pool = db.pool(2);
  let wm = null;
  const seen = [];
  let queries = 0;
  for (let i = 0; i < 20; i++) {
    const page = await fetchChanges(pool, wm, 7);
    queries++;
    if (!page.length) break;
    seen.push(...page.map((r) => r.id));
    const last = page.at(-1);
    wm = { updatedAt: last.updatedAt, id: last.id };
  }
  assert.equal(seen.length, 40, `התקבלו ${seen.length} שורות מתוך 40 — WHERE על updated_at בלבד?`);
  assert.equal(new Set(seen).size, 40);
  assert.deepEqual(seen.slice(-30), Array.from({ length: 30 }, (_, i) => i + 5));
  assert.ok(queries <= 7);
});
