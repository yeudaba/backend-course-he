import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = () => exportsOf(import.meta.url, "P08-E27.js", ["findDuplicates"]);

test("הדוגמה מהמשימה", async () => {
  const { findDuplicates } = await get();
  assert.deepEqual(findDuplicates(["a@x.com", "b@x.com", " A@x.com", "c@x.com", "b@x.com", "a@x.com"]), ["a@x.com", "b@x.com"]);
});
test("הסדר — לפי הפעם השנייה", async () => {
  const { findDuplicates } = await get();
  assert.deepEqual(findDuplicates(["a@x", "b@x", "b@x", "a@x"]), ["b@x", "a@x"]);
});
test("שלוש הופעות — פעם אחת בתוצאה", async () => {
  const { findDuplicates } = await get();
  assert.deepEqual(findDuplicates(["d@x", "D@X ", " d@x"]), ["d@x"]);
});
test("אין כפילויות / רשימה ריקה", async () => {
  const { findDuplicates } = await get();
  assert.deepEqual(findDuplicates(["a@x", "b@x"]), []);
  assert.deepEqual(findDuplicates([]), []);
});
test("קלט שאינו מערך — TypeError", async () => {
  const { findDuplicates } = await get();
  for (const bad of ["a@x", null, { 0: "a@x" }]) {
    assert.throws(() => findDuplicates(bad), (err) => err instanceof TypeError && err.message === "emails חייב להיות מערך", `findDuplicates(${JSON.stringify(bad)}) צריכה לזרוק TypeError עם ההודעה "emails חייב להיות מערך"`);
  }
});
