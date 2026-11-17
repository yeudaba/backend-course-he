import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { parseRequirements } = await load(import.meta.url, "P28-E37.ts");

test("מפריד, מדלג על ריקות והערות", () => {
  const text = "# שירות תורים\nF: לקוח בוחר שעה\n\n  NF: p95 מתחת ל־300ms  \nnf: זמינות 99.9%\n   \nf:ספר חוסם שעות\n# סוף";
  assert.deepEqual(parseRequirements(text), {
    functional: ["לקוח בוחר שעה", "ספר חוסם שעות"],
    nonFunctional: ["p95 מתחת ל־300ms", "זמינות 99.9%"],
  });
  assert.deepEqual(parseRequirements(""), { functional: [], nonFunctional: [] });
});
test("שורה לא מוכרת — שגיאה עם מספר השורה", () => {
  assert.throws(() => parseRequirements("F: א\n\nX: ב"), /שורה 3/);
  assert.throws(() => parseRequirements("F: א\nF: ב\n# ג\nזמינות גבוהה"), /שורה 4/);
  assert.throws(() => parseRequirements("NF:   "), /שורה 1/);
});
