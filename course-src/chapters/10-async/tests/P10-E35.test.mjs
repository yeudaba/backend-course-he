import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = () => exportsOf(import.meta.url, "P10-E35.js", ["blockFor"]);

test("חוסמת לפחות ms, ומחזירה את הזמן שעבר", async () => {
  const { blockFor } = await get();
  for (const ms of [20, 45]) {
    const start = Date.now();
    const got = blockFor(ms);
    const real = Date.now() - start;
    assert.equal(typeof got, "number", "blockFor צריכה להחזיר מספר");
    assert.ok(real >= ms, `blockFor(${ms}) חזרה אחרי ${real}ms — הלולאה צריכה לרוץ עד שעוברות ${ms}ms`);
    assert.ok(got >= ms && got <= real + 1, `blockFor(${ms}) החזירה ${got} — צריך את הזמן שעבר בפועל`);
  }
});
test("טיימר שנרשם קודם לא רץ באמצע", async () => {
  const { blockFor } = await get();
  let ran = false;
  setTimeout(() => (ran = true), 0);
  blockFor(30);
  assert.equal(ran, false, "הטיימר רץ באמצע — blockFor לא חוסמת באמת (setTimeout במקום לולאה?)");
  await new Promise((r) => setTimeout(r, 5));
  assert.equal(ran, true);
});
