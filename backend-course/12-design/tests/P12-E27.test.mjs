import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe } from "./_ts.mjs";

const FILE = "P12-E27.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["Money"])).Money;
const MSG = "סכום באגורות חייב להיות מספר שלם";

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("constructor פרטי ו־agorot לקריאה בלבד", () => {
  const r = typeProbe(
    import.meta.url,
    FILE,
    `import { Money } from "FILE";

const m: Money = Money.fromAgorot(100);
const n: number = m.agorot;
// @ts-expect-error — ה־constructor פרטי: יוצרים רק עם fromAgorot או fromShekels
const direct = new Money(100);
// @ts-expect-error — agorot הוא getter בלבד, אי אפשר לשנות אותו
m.agorot = 5;
// plus מקבלת Money ומחזירה Money
const sum: Money = m.plus(Money.fromShekels(1));
// @ts-expect-error — plus מקבלת Money, לא מספר
m.plus(5);

export { n, direct, sum };
`
  );
  assert.ok(r.ok, r.message);
});
test("fromShekels מעגלת לאגורות שלמות", async () => {
  const Money = await get();
  assert.equal(Money.fromShekels(19.9).agorot, 1990);
  assert.equal(Money.fromShekels(0.1).plus(Money.fromShekels(0.2)).agorot, 30);
  assert.equal(Money.fromShekels(-5).agorot, -500);
});
test("קלט לא תקין — RangeError", async () => {
  const Money = await get();
  const isRange = (e) => e instanceof RangeError && e.message === MSG;
  assert.throws(() => Money.fromAgorot(10.5), isRange, `fromAgorot(10.5) צריכה לזרוק RangeError("${MSG}")`);
  assert.throws(() => Money.fromShekels(NaN), isRange, "fromShekels(NaN)");
  assert.throws(() => Money.fromShekels(Infinity), isRange, "fromShekels(Infinity)");
});
test("plus ו־times מחזירות מופע חדש", async () => {
  const Money = await get();
  const a = Money.fromAgorot(1000);
  const b = a.plus(Money.fromAgorot(250));
  assert.equal(b.agorot, 1250);
  assert.equal(a.agorot, 1000, "plus שינתה את המופע המקורי");
  assert.notEqual(b, a);
  assert.equal(Money.fromAgorot(1990).times(1.17).agorot, 2328, "1990 × 1.17 = 2328.3 ← 2328");
  assert.equal(a.agorot, 1000);
});
test("equals", async () => {
  const Money = await get();
  assert.equal(Money.fromShekels(0.3).equals(Money.fromAgorot(30)), true);
  assert.equal(Money.fromAgorot(1).equals(Money.fromAgorot(2)), false);
});
test("toString", async () => {
  const Money = await get();
  const cases = [
    [123450, "₪1,234.50"],
    [370350, "₪3,703.50"],
    [5, "₪0.05"],
    [0, "₪0.00"],
    [-500, "-₪5.00"],
    [100000000, "₪1,000,000.00"],
    [-12345678, "-₪123,456.78"],
  ];
  for (const [agorot, expected] of cases) assert.equal(String(Money.fromAgorot(agorot)), expected, `fromAgorot(${agorot})`);
});
test("אין שדות ציבוריים שאפשר לשנות", async () => {
  const Money = await get();
  assert.deepEqual(Object.keys(Money.fromAgorot(5)), [], "הסכום צריך להיות בשדה פרטי (#agorot)");
});
