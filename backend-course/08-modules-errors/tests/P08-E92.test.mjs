import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const FILE = "P08-E92.js";
const get = () => exportsOf(import.meta.url, FILE, ["isTime", "digitsOnly", "firstNumber"]);

test("isTime: רק HH:MM, מ־00:00 עד 23:59", async () => {
  const { isTime } = await get();
  for (const t of ["00:00", "08:30", "19:05", "23:59", "20:00"]) {
    assert.equal(isTime(t), true, `isTime("${t}") צריך להיות true`);
  }
  for (const t of ["24:00", "29:15", "08:60", "8:30", "08:300", "08:30x", "x08:30", "0830", ""]) {
    assert.equal(isTime(t), false, `isTime("${t}") צריך להיות false`);
  }
});
test("digitsOnly: מוחקת כל תו שאינו ספרה", async () => {
  const { digitsOnly } = await get();
  assert.equal(digitsOnly("052-123-4567"), "0521234567", "כל המקפים, לא רק הראשון");
  assert.equal(digitsOnly("+972 (52) 123-4567"), "972521234567", "גם רווחים, סוגריים ו־+");
  assert.equal(digitsOnly("0521234567"), "0521234567");
  assert.equal(digitsOnly("אין"), "");
});
test("firstNumber: המספר הראשון, או null", async () => {
  const { firstNumber } = await get();
  assert.equal(firstNumber("הזמנה 42, 3 פריטים"), 42);
  assert.equal(firstNumber("007"), 7);
  assert.equal(firstNumber("abc123def456"), 123);
  assert.equal(firstNumber("אין כאן מספרים"), null, "בלי מספר: null (ולא שגיאה, ולא 0)");
  assert.equal(firstNumber(""), null, "טקסט ריק: null");
});
