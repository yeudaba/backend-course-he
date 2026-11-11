import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = () => exportsOf(import.meta.url, "P13-E34.mjs", ["rangeKind", "countKinds"]);

test("rangeKind", async () => {
  const { rangeKind } = await get();
  const cases = { "^1.2.3": "caret", "~1.2.3": "tilde", "1.2.3": "exact", " ^4.18.2 ": "caret", "^10.20.30": "caret", "1.2": "other", "latest": "other", "*": "other", "^1.2.x": "other", "^ 1.2.3": "other", "~^1.2.3": "other", "": "other", "1.2.3.4": "other", ">=1.0.0": "other" };
  for (const [range, kind] of Object.entries(cases)) assert.equal(rangeKind(range), kind, `rangeKind(${JSON.stringify(range)})`);
});
test("countKinds — כל הסוגים, גם 0", async () => {
  const { countKinds } = await get();
  assert.deepEqual(countKinds({ express: "^5.1.0", zod: "4.1.5", pg: "~8.16.0", old: "*", a: "^1.0.0" }), { caret: 2, tilde: 1, exact: 1, other: 1 });
  assert.deepEqual(countKinds({}), { caret: 0, tilde: 0, exact: 0, other: 0 });
});
