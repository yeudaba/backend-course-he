import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { createToolGuard } = await load(import.meta.url, "P29-E66.ts");
const OK = { ok: true };

test("תקרה כוללת", () => {
  const g = createToolGuard({ maxTotal: 3, maxPerTool: 10, maxRepeats: 10 });
  assert.deepEqual(g("a", { x: 1 }), OK);
  assert.deepEqual(g("b", { x: 2 }), OK);
  assert.deepEqual(g("c", {}), OK);
  assert.deepEqual(g("d", {}), { ok: false, reason: "total" });
  assert.deepEqual(g("d", {}), { ok: false, reason: "total" });
});
test("תקרה לכלי, ורק קריאות שאושרו נספרות", () => {
  const g = createToolGuard({ maxTotal: 5, maxPerTool: 2, maxRepeats: 5 });
  assert.deepEqual(g("search", { q: "a" }), OK);
  assert.deepEqual(g("search", { q: "b" }), OK);
  assert.deepEqual(g("search", { q: "c" }), { ok: false, reason: "per_tool" });
  assert.deepEqual(g("search", { q: "d" }), { ok: false, reason: "per_tool" });
  assert.deepEqual(g("get", { id: 1 }), OK, "החסומות לא נספרו בתקרה הכוללת");
  assert.deepEqual(g("get", { id: 2 }), OK);
  assert.deepEqual(g("other", {}), OK);
  assert.deepEqual(g("other2", {}), { ok: false, reason: "total" });
});
test("חזרה על אותו קלט — לפי ערך, בלי תלות בסדר מפתחות", () => {
  const g = createToolGuard({ maxTotal: 20, maxPerTool: 20, maxRepeats: 2 });
  assert.deepEqual(g("get", { a: 1, b: { c: 2, d: [1, { e: 3, f: 4 }] } }), OK);
  assert.deepEqual(g("get", { b: { d: [1, { f: 4, e: 3 }], c: 2 }, a: 1 }), OK);
  assert.deepEqual(g("get", { a: 1, b: { c: 2, d: [1, { e: 3, f: 4 }] } }), { ok: false, reason: "repeat" });
  assert.deepEqual(g("get", { a: 1, b: { c: 2, d: [{ e: 3, f: 4 }, 1] } }), OK, "סדר במערך כן משנה");
  assert.deepEqual(g("other", { a: 1, b: { c: 2, d: [1, { e: 3, f: 4 }] } }), OK, "כלי אחר — לא חזרה");
  assert.deepEqual(g("get", { a: "1" }), OK);
  assert.deepEqual(g("get", { a: 1 }), OK, "\"1\" ו־1 שונים");
});
test("הסדר: total לפני per_tool לפני repeat", () => {
  const g = createToolGuard({ maxTotal: 2, maxPerTool: 1, maxRepeats: 1 });
  assert.deepEqual(g("a", {}), OK);
  assert.deepEqual(g("a", {}), { ok: false, reason: "per_tool" });
  assert.deepEqual(g("b", {}), OK);
  assert.deepEqual(g("a", {}), { ok: false, reason: "total" });
});
