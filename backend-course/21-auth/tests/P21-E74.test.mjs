import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P21-E74.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["applyPatch"])).applyPatch;
const task = () => ({ id: 1, ownerId: 7, title: "חלב", done: false });
const ALLOWED = ["title", "done"];

test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("שדות מותרים", async () => {
  const applyPatch = await get();
  const t = task();
  const out = applyPatch(t, { done: true }, ALLOWED);
  assert.deepEqual(out, { id: 1, ownerId: 7, title: "חלב", done: true });
  assert.deepEqual(t, task(), "המקור לא השתנה");
  assert.notEqual(out, t);
  assert.deepEqual(applyPatch(t, { title: "לחם", done: undefined }, ALLOWED), { ...task(), title: "לחם" }, "undefined — מדלגים");
  assert.deepEqual(applyPatch(t, {}, ALLOWED), task());
});
test("שדה לא מותר ← שגיאה, ושום דבר לא משתנה", async () => {
  const applyPatch = await get();
  const t = task();
  assert.throws(() => applyPatch(t, { ownerId: 1 }, ALLOWED), { message: "שדה לא מותר: ownerId" });
  assert.throws(() => applyPatch(t, { title: "x", id: 99 }, ALLOWED), { message: "שדה לא מותר: id" });
  assert.throws(() => applyPatch(t, { done: true, role: "admin" }, ALLOWED), { message: "שדה לא מותר: role" });
  assert.deepEqual(t, task());
});
test("__proto__ מ־JSON", async () => {
  const applyPatch = await get();
  const body = JSON.parse('{"__proto__": {"role": "admin"}}');
  assert.throws(() => applyPatch(task(), body, ALLOWED), { message: "שדה לא מותר: __proto__" });
  assert.equal({}.role, undefined, "Object.prototype לא הורעל");
  assert.equal(task().role, undefined);
});
test("גוף לא תקין", async () => {
  const applyPatch = await get();
  for (const bad of [null, undefined, "title", 5, ["title"], true]) {
    assert.throws(() => applyPatch(task(), bad, ALLOWED), { message: "גוף לא תקין" }, JSON.stringify(bad));
  }
});
