import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P08-E48.js";
const get = () => exportsOf(import.meta.url, FILE, ["assertPositive"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("מספר חיובי ← מחזירה אותו", async () => {
  const { assertPositive } = await get();
  assert.equal(assertPositive(5, "מחיר"), 5);
  assert.equal(assertPositive(0.01, "x"), 0.01);
});
test("לא חיובי ← זורקת Error עם ההודעה", async () => {
  const { assertPositive } = await get();
  assert.throws(() => assertPositive(0, "כמות"), { message: "כמות חייב להיות מספר חיובי" });
  assert.throws(() => assertPositive(-3, "מחיר"), { message: "מחיר חייב להיות מספר חיובי" });
  assert.throws(() => assertPositive(NaN, "גיל"), { message: "גיל חייב להיות מספר חיובי" });
  assert.throws(() => assertPositive("5", "מחיר"), { message: "מחיר חייב להיות מספר חיובי" }, "מחרוזת היא לא מספר");
  assert.throws(() => assertPositive(undefined, "משקל"), Error);
});
test("זורקת אובייקט Error (לא מחרוזת, לא return)", async () => {
  const { assertPositive } = await get();
  let caught;
  try {
    assertPositive(-1, "x");
  } catch (err) {
    caught = err;
  }
  assert.ok(caught instanceof Error, "צריך throw new Error(...) — לא return ולא מחרוזת");
});
