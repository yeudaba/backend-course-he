import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { shippingFee } = await load(import.meta.url, "P05-E81.js");

test("לקוח רגיל (בלי הפרמטר השני) משלם 25 מתחת ל־200", () => {
  assert.equal(shippingFee(100), 25, "shippingFee(100) — לקוח שלא העביר isMember אינו חבר מועדון");
  assert.equal(shippingFee(199.9), 25);
  assert.equal(shippingFee(0), 25);
});
test("חבר מועדון — 0, ומי שהעביר false — משלם", () => {
  assert.equal(shippingFee(100, true), 0);
  assert.equal(shippingFee(100, false), 25);
});
test("200 ומעלה — חינם", () => {
  assert.equal(shippingFee(200), 0, "shippingFee(200) — 200 בדיוק כבר חינם");
  assert.equal(shippingFee(350), 0);
});
test("guard: שלילי או לא מספר ← null", () => {
  assert.equal(shippingFee(-5), null, "shippingFee(-5) צריך להחזיר null — guard clause עוצר עם return");
  assert.equal(shippingFee(-0.01, true), null);
  assert.equal(shippingFee("abc"), null);
  assert.equal(shippingFee("150"), null, "גם מחרוזת של ספרות אינה מספר");
});
