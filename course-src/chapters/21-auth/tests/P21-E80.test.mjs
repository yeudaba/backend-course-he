import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = () => exportsOf(import.meta.url, "P21-E80.ts", ["pagingSchema", "parsePaging"]);

test("ברירות מחדל וערכים מ־query string", async () => {
  const { parsePaging, pagingSchema } = await get();
  assert.equal(typeof pagingSchema.safeParse, "function");
  assert.deepEqual(parsePaging({}), { ok: true, limit: 20, offset: 0 });
  assert.deepEqual(parsePaging({ limit: "5", offset: "40", sort: "x" }), { ok: true, limit: 5, offset: 40 });
  assert.deepEqual(parsePaging({ limit: "50", offset: "10000" }), { ok: true, limit: 50, offset: 10000 });
  assert.deepEqual(parsePaging({ limit: "1" }), { ok: true, limit: 1, offset: 0 });
});
test("גבולות", async () => {
  const { parsePaging } = await get();
  assert.deepEqual(parsePaging({ limit: "5000000" }), { ok: false, errors: ["limit עד 50"] });
  assert.deepEqual(parsePaging({ limit: "51" }), { ok: false, errors: ["limit עד 50"] });
  assert.deepEqual(parsePaging({ limit: "0" }), { ok: false, errors: ["limit מ־1"] });
  assert.deepEqual(parsePaging({ limit: "-1" }), { ok: false, errors: ["limit מ־1"] });
  assert.deepEqual(parsePaging({ offset: "10001" }), { ok: false, errors: ["offset עד 10000"] });
  const r = parsePaging({ limit: "99", offset: "20000" });
  assert.deepEqual(r, { ok: false, errors: ["limit עד 50", "offset עד 10000"] }, "כל השגיאות");
});
test("לא מספר שלם", async () => {
  const { parsePaging } = await get();
  for (const q of [{ limit: "abc" }, { limit: "2.5" }, { offset: "-3" }, { offset: "x" }]) {
    const r = parsePaging(q);
    assert.equal(r.ok, false, JSON.stringify(q));
    assert.equal(r.errors.length, 1, JSON.stringify(q));
  }
});
