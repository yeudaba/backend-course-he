import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fastEnough } from "./_perf.mjs";

const { buildTree } = await load(import.meta.url, "P27-E67.ts");

test("עץ ממוין", () => {
  const rows = [
    { id: 5, parentId: 2, name: "קומקומים" },
    { id: 1, parentId: null, name: "קפה" },
    { id: 2, parentId: 1, name: "ציוד" },
    { id: 3, parentId: 1, name: "פולים" },
    { id: 4, parentId: 2, name: "מטחנות" },
    { id: 9, parentId: null, name: "מרצ'נדייז" },
  ];
  assert.deepEqual(buildTree(rows), [
    { id: 9, name: "מרצ'נדייז", children: [] },
    { id: 1, name: "קפה", children: [
      { id: 3, name: "פולים", children: [] },
      { id: 2, name: "ציוד", children: [{ id: 4, name: "מטחנות", children: [] }, { id: 5, name: "קומקומים", children: [] }] },
    ] },
  ]);
  assert.deepEqual(buildTree([]), []);
});
test("ORPHAN ו־CYCLE", () => {
  assert.throws(() => buildTree([{ id: 1, parentId: null, name: "a" }, { id: 2, parentId: 77, name: "b" }]), { message: "ORPHAN 2" });
  assert.throws(() => buildTree([{ id: 1, parentId: null, name: "a" }, { id: 7, parentId: 3, name: "b" }, { id: 3, parentId: 7, name: "c" }]), { message: "CYCLE" });
  assert.throws(() => buildTree([{ id: 1, parentId: 1, name: "self" }]), { message: "CYCLE" });
});
test("שרשרת של 200,000 — בלי רקורסיה, מהר", () => {
  const rows = Array.from({ length: 200_000 }, (_, i) => ({ id: i, parentId: i === 0 ? null : i - 1, name: `n${i}` }));
  const roots = fastEnough(() => buildTree(rows), 500, "buildTree על שרשרת");
  let depth = 0;
  for (let n = roots[0]; n.children.length; n = n.children[0]) depth++;
  assert.equal(depth, 199_999);
});
