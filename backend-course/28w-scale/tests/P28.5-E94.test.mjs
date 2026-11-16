import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { runSync } = await load(import.meta.url, "P28.5-E94.ts");

function world(n, { failOn } = {}) {
  const src = Array.from({ length: n }, (_, i) => ({ id: i + 1, updatedAt: new Date(Date.UTC(2026, 9, 1, 0, Math.floor(i / 3))).toISOString() }));
  const log = [];
  let saved = null;
  const written = [];
  const deps = {
    async loadWm() { log.push("load"); return saved; },
    async fetchAfter(wm, limit) {
      log.push(`fetch:${wm ? wm.id : "-"}`);
      return src.filter((r) => !wm || r.updatedAt > wm.updatedAt || (r.updatedAt === wm.updatedAt && r.id > wm.id)).slice(0, limit);
    },
    async writeBatch(rows, k) {
      log.push(`write:${k}:${rows.length}`);
      if (failOn === k) throw new Error("S3 down");
      written.push(...rows.map((r) => r.id));
    },
    async saveWm(wm) { log.push(`save:${wm.id}`); saved = wm; },
  };
  return { deps, log, written, saved: () => saved, setSaved: (w) => { saved = w; } };
}

test("עמודים, סדר הפעולות ועצירה בעמוד קצר", async () => {
  const w = world(10);
  const r = await runSync(w.deps, 4);
  assert.deepEqual(r, { pages: 3, rows: 10, wm: { id: 10, updatedAt: "2026-10-01T00:03:00.000Z" } });
  assert.deepEqual(w.log, ["load", "fetch:-", "write:1:4", "save:4", "fetch:4", "write:2:4", "save:8", "fetch:8", "write:3:2", "save:10"]);
  assert.deepEqual(w.written, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
});
test("עמוד מלא אחרון ← עוד fetch ריק; וריצה שנייה ממשיכה", async () => {
  const w = world(8);
  const r = await runSync(w.deps, 4);
  assert.equal(r.pages, 2);
  assert.equal(w.log.at(-1), "fetch:8");
  const again = await runSync(w.deps, 4);
  assert.deepEqual(again, { pages: 0, rows: 0, wm: { id: 8, updatedAt: "2026-10-01T00:02:00.000Z" } });
});
test("כתיבה נכשלה ← לא נשמר watermark לעמוד הזה", async () => {
  const w = world(10, { failOn: 2 });
  await assert.rejects(runSync(w.deps, 4), /S3 down/);
  assert.equal(w.saved().id, 4);
  assert.ok(!w.log.includes("save:8"));
});
test("ברירת מחדל 1,000", async () => {
  const w = world(2500);
  const r = await runSync(w.deps);
  assert.equal(r.pages, 3);
  assert.deepEqual(w.log.filter((x) => x.startsWith("write")), ["write:1:1000", "write:2:1000", "write:3:500"]);
});
