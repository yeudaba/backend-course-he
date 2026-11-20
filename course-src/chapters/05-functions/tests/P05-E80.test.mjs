import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P05-E80.js";
const get = () => exportsOf(import.meta.url, FILE, ["splitBill","billSummary"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

// כל קריאה נבדקת לבד, וההודעה אומרת על איזה קלט נכשלה
const show = (v) => (typeof v === "string" ? `"${v}"` : String(v));
const call = (name, args) => `${name}(${args.map(show).join(", ")})`;
const check = (fn, name, args, expected, why = "") => {
  const got = fn(...args);
  assert.ok(Object.is(got, expected), `${call(name, args)} צריכה להחזיר ${show(expected)}, והחזירה ${show(got)}${why ? ` — ${why}` : ""}`);
};

test("splitBill", async () => {
  const { splitBill } = await get();
  check(splitBill, "splitBill", [487, 6, 12], 91);
  check(splitBill, "splitBill", [100, 4], 28, "בלי tipPercent — ברירת המחדל היא טיפ 10%");
  check(splitBill, "splitBill", [300, 7, 15], 50, "345 ÷ 7 = 49.28..., ומעגלים למעלה");
  check(splitBill, "splitBill", [90, 3, 0], 30, "טיפ 0% הוא ערך חוקי");
});
test("splitBill — קלט לא תקין", async () => {
  const { splitBill } = await get();
  check(splitBill, "splitBill", [100, 0], null, "אפס אנשים");
  check(splitBill, "splitBill", [100, 2.5], null, "מספר אנשים חייב להיות שלם");
  check(splitBill, "splitBill", [0, 4], null, "סכום חייב להיות חיובי");
  check(splitBill, "splitBill", [-50, 4], null, "סכום שלילי");
  check(splitBill, "splitBill", [NaN, 4], null, "NaN <= 0 הוא false, ולכן guard כמו total <= 0 לא תופס אותו");
});
test("billSummary", async () => {
  const { billSummary } = await get();
  check(billSummary, "billSummary", [100, 4], "4 סועדים × 28 ₪ = 112 ₪ (כולל טיפ 10%)");
  check(billSummary, "billSummary", [487, 6, 12], "6 סועדים × 91 ₪ = 546 ₪ (כולל טיפ 12%)", "הסכום הוא מה שנאסף בפועל: 6 × 91");
  check(billSummary, "billSummary", [100, 2.5], "קלט לא תקין");
});
test("billSummary משתמשת ב־splitBill", () => {
  assert.match(src(), /function\s+billSummary[\s\S]*splitBill\s*\(|billSummary\s*=[\s\S]*splitBill\s*\(/, "billSummary צריכה לקרוא ל־splitBill");
});
