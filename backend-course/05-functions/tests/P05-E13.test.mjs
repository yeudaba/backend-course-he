import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { validateEmail } = await load(import.meta.url, "P05-E13.js");

test("אימייל תקין (גם עם רווחים מסביב)", () => { assert.equal(validateEmail("dana@mail.com"), null); assert.equal(validateEmail("  a.b@c.co.il "), null); });
test("ריק", () => { assert.equal(validateEmail(""), "חובה להזין אימייל"); assert.equal(validateEmail("   "), "חובה להזין אימייל"); });
test("רווח באמצע", () => assert.equal(validateEmail("dana levi@mail.com"), "אימייל לא יכול להכיל רווחים"));
test("@ חסר או בקצה", () => {
  assert.equal(validateEmail("dana.mail.com"), "חסר @ במקום הנכון");
  assert.equal(validateEmail("@mail.com"), "חסר @ במקום הנכון");
  assert.equal(validateEmail("dana@"), "חסר @ במקום הנכון");
});
test("אין נקודה אחרי ה־@", () => { assert.equal(validateEmail("dana@mail"), "חסר דומיין תקין"); assert.equal(validateEmail("da.na@mail"), "חסר דומיין תקין"); });
