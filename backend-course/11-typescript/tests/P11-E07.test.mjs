import { test } from "node:test";
import assert from "node:assert/strict";
import { load, typecheck } from "../../tools/load.mjs";

const { cleanTags, chunk, median } = await load(import.meta.url, "P11-E07.ts");

test("עובר בדיקת טיפוסים (tsc --strict)", () => { const r = typecheck(import.meta.url, "P11-E07.ts"); assert.ok(r.ok, r.output); });
test("ההתנהגות לא השתנתה", () => {
  assert.deepEqual(cleanTags(" A, b ,a"), ["a", "b"]);
  assert.deepEqual(chunk([1, 2, 3], 2), [[1, 2], [3]]);
  assert.equal(median([3, 1, 2]), 2);
  assert.equal(median([]), null);
});
