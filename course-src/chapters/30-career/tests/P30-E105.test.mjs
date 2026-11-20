import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { depChanges } = await load(import.meta.url, "P30-E105.ts");

test("הוספה, הסרה, major", () => {
  const before = { dependencies: { express: "^4.21.0", zod: "^3.23.0", lodash: "^4.17.21" }, devDependencies: { vitest: "^2.1.0", typescript: "~5.6.0" } };
  const after = { dependencies: { express: "^5.1.0", zod: "^3.25.0", "express-rate-limiter-pro": "^1.0.0", helmet: "8.1.0" }, devDependencies: { vitest: "^3.2.0", typescript: "~5.9.0" } };
  assert.deepEqual(depChanges(before, after), {
    added: ["express-rate-limiter-pro@^1.0.0", "helmet@8.1.0"],
    removed: ["lodash"],
    major: ["express: 4 → 5", "vitest: 2 → 3"],
    needsReview: true,
  });
});
test("רק minor/patch, או רק הסרה ← לא צריך review", () => {
  assert.deepEqual(depChanges({ dependencies: { a: "^1.2.0" } }, { dependencies: { a: "^1.9.0" } }), { added: [], removed: [], major: [], needsReview: false });
  assert.deepEqual(depChanges({ dependencies: { a: "1.0.0", b: "2" } }, { dependencies: { a: "1.0.0" } }), { added: [], removed: ["b"], major: [], needsReview: false });
  assert.deepEqual(depChanges({}, {}), { added: [], removed: [], major: [], needsReview: false });
  assert.deepEqual(depChanges({ dependencies: { a: "latest" } }, { dependencies: { a: "^3.0.0" } }).major, [], "בלי מספר — לא major");
  assert.deepEqual(depChanges({ devDependencies: { a: "^1.0.0" } }, { dependencies: { a: "^1.0.0" } }), { added: [], removed: [], major: [], needsReview: false }, "מעבר בין sections — לא שינוי");
});
test("רק תלות חדשה (בלי major) ← needsReview", () => {
  assert.equal(depChanges({ dependencies: {} }, { dependencies: { x: "^1.0.0" } }).needsReview, true, "תלות חדשה לבדה — כבר צריך בדיקה");
});
