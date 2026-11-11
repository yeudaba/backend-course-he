import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P08-E43.mjs";
const get = () => exportsOf(import.meta.url, FILE, ["convert","formatMoney"], "export");
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("השערים — ייצוא default", async () => {
  const mod = await exportsOf(import.meta.url, "P08-E43-rates.mjs", [], "export");
  assert.deepEqual(mod.default, { ILS: 1, USD: 3.7, EUR: 4 }, "export default { ILS: 1, USD: 3.7, EUR: 4 }");
});
test("convert", async () => {
  const { convert } = await get();
  assert.equal(convert(37, "ILS", "USD"), 10);
  assert.equal(convert(10, "EUR", "USD"), 10.81);
  assert.equal(convert(10, "USD", "ILS"), 37);
  assert.equal(convert(1, "ILS", "ILS"), 1);
  assert.equal(convert(5, "USD", "GBP"), null);
  assert.equal(convert(5, "XXX", "ILS"), null);
});
test("formatMoney", async () => {
  const { formatMoney } = await get();
  assert.equal(formatMoney(12.5, "ILS"), "₪12.50");
  assert.equal(formatMoney(3.7, "USD"), "$3.70");
  assert.equal(formatMoney(4, "EUR"), "€4.00");
  assert.equal(formatMoney(12.5, "XYZ"), "12.50 XYZ");
});
test("השערים מיובאים", () => {
  assert.match(src(), /import\s+\w+\s+from\s*["']\.\/P08-E43-rates\.mjs["']/, 'חסר import rates from "./P08-E43-rates.mjs"');
  assert.doesNotMatch(src(), /3\.7/, "אל תעתיק את השערים — ייבא אותם");
});
