import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe } from "./_ts.mjs";

const FILE = "P12-E76.ts";
const get = () => exportsOf(import.meta.url, FILE, ["ValidationError", "parseItems"]);

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("החתימה", () => {
  const r = typeProbe(import.meta.url, FILE, `import { parseItems } from "FILE";
const raw: unknown = [];
const items: { productId: number; qty: number }[] = parseItems(raw);
export { items };
`);
  assert.ok(r.ok, r.message);
});
test("תקינים, ומיזוג לפי productId", async () => {
  const { parseItems } = await get();
  assert.deepEqual(parseItems([{ productId: 7, qty: 2 }, { productId: 3, qty: 1 }, { productId: 7, qty: 5 }]), [{ productId: 7, qty: 7 }, { productId: 3, qty: 1 }]);
  assert.deepEqual(parseItems([{ productId: 1, qty: 100, note: "x" }]), [{ productId: 1, qty: 100 }], "שדות נוספים לא עוברים");
  assert.equal(parseItems(Array.from({ length: 50 }, (_, i) => ({ productId: i + 1, qty: 1 }))).length, 50);
});
test("שגיאות עם נתיב", async () => {
  const { parseItems, ValidationError } = await get();
  const LIST = "items חייב להיות מערך של 1–50 פריטים";
  const cases = [
    [{}, "items", LIST],
    [[], "items", LIST],
    [Array.from({ length: 51 }, () => ({ productId: 1, qty: 1 })), "items", LIST],
    [[{ productId: 1, qty: 1 }, "x"], "items[1]", "items[1] לא תקין"],
    [[{ productId: 1, qty: 1 }, null], "items[1]", "items[1] לא תקין"],
    [[{ productId: 1, qty: 1 }, { productId: 2, qty: 0 }], "items[1].qty", "items[1].qty לא תקין"],
    [[{ productId: 1, qty: 101 }], "items[0].qty", "items[0].qty לא תקין"],
    [[{ productId: 1, qty: 1.5 }], "items[0].qty", "items[0].qty לא תקין"],
    [[{ productId: "1", qty: 1 }], "items[0].productId", "items[0].productId לא תקין"],
    [[{ qty: 1 }], "items[0].productId", "items[0].productId לא תקין"],
    [[{ productId: 1, qty: 1 }, { productId: 2, qty: 1 }, { productId: -2, qty: 1 }], "items[2].productId", "items[2].productId לא תקין"],
    [[{ productId: 1, qty: 60 }, { productId: 1, qty: 50 }], "items", "יותר מ־100 יחידות של מוצר 1"],
  ];
  for (const [input, field, message] of cases) {
    assert.throws(() => parseItems(input), (e) => e instanceof ValidationError && e.field === field && e.message === message, `${JSON.stringify(input).slice(0, 60)} ← ${field}`);
  }
});
