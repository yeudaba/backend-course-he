import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe } from "./_ts.mjs";

const FILE = "P12-E81.ts";
const get = () => exportsOf(import.meta.url, FILE, ["Converter", "UnknownCurrencyError"]);
// מקור שערים מזויף שסופר כמה פעמים שאלו אותו
const source = (rates) => {
  const asked = [];
  return { asked, rateOf(c) { asked.push(c); return rates[c]; } };
};

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("החתימות", () => {
  const r = typeProbe(import.meta.url, FILE, `import { Converter, UnknownCurrencyError } from "FILE";
import type { RateSource } from "FILE";
const s: RateSource = { rateOf: (c: string) => (c === "USD" ? 3.7 : undefined) };
const c = new Converter(s);
const n: number = c.toIls(1, "USD") + c.fromIls(1, "USD");
const e = new UnknownCurrencyError("XYZ");
const code: string = e.currency;
// @ts-expect-error — currency הוא readonly
e.currency = "ABC";
// @ts-expect-error — מקור שערים חייב rateOf
new Converter({});
export { n, code };
`);
  assert.ok(r.ok, r.message);
});
test("toIls ו־fromIls לפי המקור שהוזרק", async () => {
  const { Converter } = await get();
  const a = new Converter(source({ USD: 3.7, EUR: 4 }));
  assert.equal(a.toIls(10, "USD"), 37, "toIls(10, \"USD\") עם שער 3.7");
  assert.equal(a.toIls(2.5, "EUR"), 10, "toIls(2.5, \"EUR\") עם שער 4");
  assert.equal(a.fromIls(37, "USD"), 10, "fromIls(37, \"USD\") עם שער 3.7");
  assert.equal(a.fromIls(10, "USD"), 2.7, "fromIls(10, \"USD\") = 2.7027… ← 2.7 (2 ספרות)");
  assert.equal(a.toIls(1.15, "USD"), 4.26, "toIls(1.15, \"USD\") = 4.255 ← 4.26 (2 ספרות)");
  const b = new Converter(source({ USD: 3.5 }));
  assert.equal(b.toIls(10, "USD"), 35, "מקור אחר עם שער 3.5 ← 35. השער בא מהמקור, לא קבוע בקוד");
});
test("ILS — בלי לשאול את המקור", async () => {
  const { Converter } = await get();
  const s = source({});
  const c = new Converter(s);
  assert.equal(c.toIls(12.5, "ILS"), 12.5);
  assert.equal(c.fromIls(12.5, "ILS"), 12.5);
  assert.deepEqual(s.asked, [], "עבור \"ILS\" לא שואלים את מקור השערים");
});
test("מטבע לא מוכר ← UnknownCurrencyError", async () => {
  const { Converter, UnknownCurrencyError } = await get();
  const c = new Converter(source({ USD: 3.7, BAD: 0, NEG: -1 }));
  for (const [fn, cur] of [["toIls", "XYZ"], ["fromIls", "XYZ"], ["toIls", "BAD"], ["fromIls", "NEG"]]) {
    assert.throws(() => c[fn](10, cur), (err) => {
      assert.ok(err instanceof UnknownCurrencyError, `${fn}(10, "${cur}") צריכה לזרוק UnknownCurrencyError`);
      assert.equal(err.message, `מטבע לא מוכר: ${cur}`, `${fn}(10, "${cur}") — ההודעה`);
      assert.equal(err.currency, cur, `${fn}(10, "${cur}") — השדה currency`);
      return true;
    }, `${fn}(10, "${cur}") צריכה לזרוק (שער ${cur === "XYZ" ? "חסר" : "≤ 0"})`);
  }
  const e = new UnknownCurrencyError("ABC");
  assert.ok(e instanceof Error, "UnknownCurrencyError צריכה לרשת מ־Error");
  assert.equal(e.name, "UnknownCurrencyError", "name — שם המחלקה");
});
test("המקור שמור בשדה פרטי", async () => {
  const { Converter } = await get();
  const c = new Converter(source({}));
  assert.deepEqual(Object.keys(c), [], "המקור צריך להיות בשדה פרטי (#)");
});
