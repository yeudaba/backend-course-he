import { test } from "node:test";
import assert from "node:assert/strict";
import { mongoSandbox } from "../../tools/mongo.mjs";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25.7-E53.ts", ["ordersPage"])).ordersPage;

test("כל העמודים, בלי כפילויות — גם עם אותו זמן", async (t) => {
  const f = await get();
  const { db } = await mongoSandbox(t, import.meta.url);
  const same = new Date("2026-10-21T21:55:00Z");
  await db.collection("orders").insertMany([{ _id: "o6a", createdAt: same, total: 1 }, { _id: "o6b", createdAt: same, total: 2 }]);
  const seen = [];
  let after;
  let pages = 0;
  for (;;) {
    const r = await f(db, { limit: 3, after });
    seen.push(...r.items.map((o) => o.id));
    pages++;
    if (!r.next) break;
    after = r.next;
  }
  assert.deepEqual(seen, ["o10", "o9", "o8", "o7", "o6b", "o6a", "o6", "o5", "o4", "o3", "o2", "o1"]);
  assert.equal(pages, 5, "4 מלאים ועוד עמוד ריק בסוף");
});
test("מבנה ו־cursor", async (t) => {
  const f = await get();
  const { db } = await mongoSandbox(t, import.meta.url);
  const r = await f(db, { limit: 2 });
  assert.deepEqual(r, { items: [{ id: "o10", createdAt: "2026-11-03T13:00:00.000Z", total: 100 }, { id: "o9", createdAt: "2026-11-01T22:10:00.000Z", total: 144 }], next: "2026-11-01T22:10:00.000Z|o9" });
  assert.deepEqual((await f(db, { limit: 20 })).next, null);
  for (const bad of ["", "nope", "2026-11-01T22:10:00.000Z", "x|o9", "2026-11-01|"]) await assert.rejects(f(db, { limit: 2, after: bad }), { message: "BAD_CURSOR" }, bad);
});
