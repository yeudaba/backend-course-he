import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { compareWm, changesAfter } = await load(import.meta.url, "P28.5-E89.ts");
const r = (id, t) => ({ id, updatedAt: t, status: "x" });

test("compareWm", () => {
  assert.ok(compareWm({ updatedAt: "2026-10-01T10:00:00Z", id: 5 }, { updatedAt: "2026-10-01T10:00:01Z", id: 1 }) < 0);
  assert.ok(compareWm({ updatedAt: "2026-10-01T10:00:00Z", id: 5 }, { updatedAt: "2026-10-01T10:00:00Z", id: 3 }) > 0);
  assert.equal(compareWm({ updatedAt: "2026-10-01T10:00:00Z", id: 3 }, { updatedAt: "2026-10-01T12:00:00+02:00", id: 3 }), 0);
});
test("עמודים בלי לדלג על אותו זמן", () => {
  const T = "2026-10-01T10:00:00.000Z";
  const rows = [r(9, "2026-10-01T11:00:00Z"), r(4, T), r(1, T), r(3, T), r(2, T), r(7, "2026-10-01T09:00:00Z")];
  const before = JSON.stringify(rows);
  let wm = null;
  const seen = [];
  for (let i = 0; i < 10; i++) {
    const { page, next } = changesAfter(rows, wm, 2);
    seen.push(...page.map((x) => x.id));
    if (!page.length) { assert.deepEqual(next, wm); break; }
    wm = next;
  }
  assert.deepEqual(seen, [7, 1, 2, 3, 4, 9]);
  assert.deepEqual(wm, { updatedAt: "2026-10-01T11:00:00Z", id: 9 });
  assert.equal(JSON.stringify(rows), before);
});
