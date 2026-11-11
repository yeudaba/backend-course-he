import { test } from "node:test";
import assert from "node:assert/strict";
import { run, sameOutput, printed } from "./_out.mjs";

const FILE = "P03-E24.js";
const order = ({ code, qty, coupon, loggedIn } = {}) =>
  run(import.meta.url, FILE, {
    changes: [
      ...(code === undefined ? [] : [[/(productCode\s*=\s*)(["'`]).*?\2/, `$1"${code}"`, "את const productCode = ..."]]),
      ...(qty === undefined ? [] : [[/(quantityInput\s*=\s*)(["'`]).*?\2/, `$1"${qty}"`, "את const quantityInput = ..."]]),
      ...(coupon === undefined ? [] : [[/(couponInput\s*=\s*)(["'`]).*?\2/, `$1"${coupon}"`, "את const couponInput = ..."]]),
      ...(loggedIn === undefined ? [] : [[/(isLoggedIn\s*=\s*)(true|false)/, `$1${loggedIn}`, "את const isLoggedIn = ..."]]),
    ],
  });

test("ההזמנה מהתרגיל (VIP20)", () => {
  sameOutput(order(), ["מוצר: KB-102 × 3", "ביניים: 747.00", "קופון VIP20: -149.40", "לתשלום: 597.60"]);
});

test("קופון WELCOME על 2 עכברים", () => {
  sameOutput(order({ code: "ms-201", qty: "2", coupon: " welcome " }), ["מוצר: MS-201 × 2", "ביניים: 178.00", "קופון WELCOME: -30.00", "לתשלום: 148.00"]);
});

test("בלי קופון — בלי שורת קופון", () => {
  sameOutput(order({ code: "KB-101", qty: "1", coupon: "" }), ["מוצר: KB-101 × 1", "ביניים: 199.00", "לתשלום: 199.00"]);
});

for (const [why, input] of [
  ["לא מחובר", { loggedIn: false }],
  ["מוצר לא קיים", { code: "XX-999" }],
  ["כמות שאינה מספר", { qty: "abc" }],
  ["כמות ריקה", { qty: "" }],
  ["כמות לא שלמה", { qty: "2.5" }],
  ["כמות 0", { qty: "0" }],
  ["כמות 6 (מעל 5)", { qty: "6" }],
  ["קופון לא קיים", { coupon: "FREE" }],
  ["VIP20 על 498 (לא מעל 500)", { qty: "2" }],
]) {
  test(`שגיאה: ${why}`, () => {
    const r = order(input);
    printed(r);
    assert.equal(r.lines.length, 1, `ציפינו לשורת שגיאה אחת בלבד, והודפסו ${r.lines.length}: ${r.lines.join(" / ")}`);
    assert.match(r.lines[0], /^שגיאה: /, "הודעת שגיאה מתחילה ב־'שגיאה: '");
  });
}
