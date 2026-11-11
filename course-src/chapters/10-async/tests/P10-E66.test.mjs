import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = () => exportsOf(import.meta.url, "P10-E66.js", ["checkAge"]);

test("מותר / אסור, אחרי ההמתנה", async () => {
  const { checkAge } = await get();
  const start = Date.now();
  const p = checkAge(20);
  assert.ok(p instanceof Promise, "checkAge צריכה להחזיר Promise");
  assert.equal(await p, "מותר");
  assert.ok(Date.now() - start >= 8, "התשובה צריכה להגיע אחרי 10ms");
  assert.equal(await checkAge(18), "מותר", "18 — מותר");
  assert.equal(await checkAge(17), "אסור");
  assert.equal(await checkAge(0), "אסור", "0 הוא גיל תקין (אסור)");
});
test("קלט לא תקין ← RangeError, גם הוא אחרי ההמתנה", async () => {
  const { checkAge } = await get();
  for (const bad of [-3, "20", undefined, null, NaN]) {
    const start = Date.now();
    await assert.rejects(checkAge(bad), (e) => e instanceof RangeError && e.message === "גיל לא תקין", `checkAge(${String(bad)}) צריכה להיכשל עם RangeError("גיל לא תקין")`);
    assert.ok(Date.now() - start >= 8, `checkAge(${String(bad)}): גם הכישלון מגיע אחרי 10ms`);
  }
});
