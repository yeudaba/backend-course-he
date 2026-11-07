import { test } from "node:test";
import assert from "node:assert/strict";
import { load, typecheck } from "../../tools/load.mjs";

const { area, describe } = await load(import.meta.url, "P11-E16.ts");

test("עובר בדיקת טיפוסים (tsc --strict)", () => { const r = typecheck(import.meta.url, "P11-E16.ts"); assert.ok(r.ok, r.output); });
test("area", () => { assert.equal(area({ kind: "circle", radius: 2 }), 12.57); assert.equal(area({ kind: "rect", width: 3, height: 4 }), 12); assert.equal(area({ kind: "triangle", base: 6, height: 2 }), 6); });
test("describe", () => {
  assert.equal(describe({ kind: "circle", radius: 2 }), "עיגול ברדיוס 2");
  assert.equal(describe({ kind: "rect", width: 3, height: 4 }), "מלבן 3×4");
  assert.equal(describe({ kind: "triangle", base: 6, height: 2 }), "משולש בסיס 6 גובה 2");
});
