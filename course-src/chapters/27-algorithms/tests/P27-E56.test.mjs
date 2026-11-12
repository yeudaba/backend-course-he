import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fastEnough } from "./_perf.mjs";

const { diffObjects } = await load(import.meta.url, "P27-E56.ts");

test("added, removed, changed", () => {
  const before = { name: "V60", price: 2990, tags: ["gear"], stock: 3, note: undefined };
  const after = { price: 3190, tags: ["gear"], stock: 3, name: "V60", color: "white", note: null };
  assert.deepEqual(diffObjects(before, after), {
    added: ["color"],
    removed: [],
    changed: [{ key: "note", from: undefined, to: null }, { key: "price", from: 2990, to: 3190 }],
  });
  assert.deepEqual(diffObjects({ b: 1, a: [1, 2] }, { a: [2, 1] }), { added: [], removed: ["b"], changed: [{ key: "a", from: [1, 2], to: [2, 1] }] });
  assert.deepEqual(diffObjects({}, {}), { added: [], removed: [], changed: [] });
  assert.deepEqual(diffObjects({ toString: 1 }, {}).removed, ["toString"], "רק מפתחות של האובייקט עצמו");
  assert.deepEqual(diffObjects({}, { toString: 1 }).added, ["toString"]);
});
test("100,000 מפתחות — מהר", () => {
  const a = {}, b = {};
  for (let i = 0; i < 100_000; i++) { a[`k${i}`] = i; if (i % 3) b[`k${i}`] = i % 2 ? i : -i; }
  b.extra = 1;
  const r = fastEnough(() => diffObjects(a, b), 400, "diffObjects");
  assert.equal(r.removed.length, 33_334);
  assert.deepEqual(r.added, ["extra"]);
});
