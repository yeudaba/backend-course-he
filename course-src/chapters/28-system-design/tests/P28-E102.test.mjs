import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P28-E102.ts", ["mergeFeeds"])).mergeFeeds;
const P = (id, h, shop) => ({ id, createdAt: `2026-11-20T${String(h).padStart(2, "0")}:00:00.000Z`, shop });

test("החדשים, בלי כפילויות, בדיוק limit", async () => {
  const f = await get();
  const a = [P(9, 12, "a"), P(5, 10, "a"), P(2, 8, "a")];
  const b = [P(9, 12, "b"), P(7, 11, "b"), P(3, 8, "b"), P(1, 7, "b")];
  const before = JSON.stringify([a, b]);
  assert.deepEqual(f([a, b], 4).map((p) => p.id), [9, 7, 5, 3], "פוסט 9 משותף — פעם אחת; תיקו ב־08:00 — id גבוה קודם");
  assert.deepEqual(f([a, b], 10).map((p) => p.id), [9, 7, 5, 3, 2, 1]);
  assert.deepEqual(f([a, b], 1).map((p) => p.id), [9]);
  assert.equal(JSON.stringify([a, b]), before, "הרשימות השתנו");
});
test("רשימות ריקות", async () => {
  const f = await get();
  assert.deepEqual(f([], 5), []);
  assert.deepEqual(f([[], [P(1, 1, "x")]], 5).map((p) => p.id), [1]);
});
