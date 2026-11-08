import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { referenceRing } from "./_ring.mjs";

const { movedFraction, moduloShard, compareResharding } = await load(import.meta.url, "P28-E16.ts");
const keys = Array.from({ length: 20_000 }, (_, i) => `order:${i}`);

test("movedFraction", () => {
  assert.equal(movedFraction(["a", "b", "c", "d"], (k) => k, (k) => (k === "b" ? "x" : k)), 0.25);
  assert.equal(movedFraction([], (k) => k, (k) => k), 0);
});
test("moduloShard — מספר בין 0 ל־n−1, קבוע לאותו מפתח", () => {
  for (const k of keys.slice(0, 200)) {
    const s = moduloShard(k, 7);
    assert.ok(Number.isInteger(s) && s >= 0 && s < 7);
    assert.equal(moduloShard(k, 7), s);
  }
});
test("מ־4 ל־5 שרתים: modulo מזיז כמעט הכול, טבעת — כחמישית", () => {
  const r = compareResharding(keys, 4, 5, () => referenceRing());
  assert.ok(r.modulo > 0.7, `modulo: ${r.modulo} — צפוי כ־80%`);
  assert.ok(r.ring > 0.1 && r.ring < 0.3, `ring: ${r.ring} — צפוי כ־20%`);
});
