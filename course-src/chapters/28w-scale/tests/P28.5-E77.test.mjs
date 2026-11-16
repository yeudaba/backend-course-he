import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { toColumns, encodeColumn, decodeColumn } = await load(import.meta.url, "P28.5-E77.ts");

test("toColumns", () => {
  assert.deepEqual(toColumns([{ id: 1, cat: "beans" }, { cat: "brewing", id: 2 }, { id: 3 }]), { id: [1, 2, 3], cat: ["beans", "brewing", null] });
  assert.deepEqual(toColumns([]), {});
});
test("encodeColumn", () => {
  const v = ["IL", "IL", "IL", "US", "US", "IL", "DE", "DE"];
  assert.deepEqual(encodeColumn(v), { dict: ["IL", "US", "DE"], runs: [[0, 3], [1, 2], [0, 1], [2, 2]] });
  assert.deepEqual(encodeColumn([]), { dict: [], runs: [] });
  assert.deepEqual(encodeColumn([null, null, 0, 0, "0"]), { dict: [null, 0, "0"], runs: [[0, 2], [1, 2], [2, 1]] });
});
test("הלוך וחזור, וממוין נדחס", () => {
  const v = Array.from({ length: 10_000 }, (_, i) => ["beans", "brewing", "equipment", "accessories"][(i * 7) % 4]);
  assert.deepEqual(decodeColumn(encodeColumn(v)), v);
  const sorted = [...v].sort();
  const enc = encodeColumn(sorted);
  assert.equal(enc.runs.length, 4);
  assert.deepEqual(decodeColumn(enc), sorted);
});
test("מהיר על הרבה ערכים שונים", () => {
  const v = Array.from({ length: 200_000 }, (_, i) => `u${i}`);
  const t0 = performance.now();
  assert.equal(encodeColumn(v).dict.length, 200_000);
  assert.ok(performance.now() - t0 < 1000, "Map ולא indexOf");
});
