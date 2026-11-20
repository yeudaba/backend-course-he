import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P22-E55.ts", ["invalidCases"])).invalidCases;

test("מקרה בלי השדה, ואז ערך שגוי אחד בכל פעם", async () => {
  const f = await get();
  const valid = { title: "חלב", priority: "high", done: false };
  assert.deepEqual(f(valid, { title: ["", 5], priority: ["urgent"] }), [
    { name: "בלי title", body: { priority: "high", done: false } },
    { name: 'title = ""', body: { title: "", priority: "high", done: false } },
    { name: "title = 5", body: { title: 5, priority: "high", done: false } },
    { name: "בלי priority", body: { title: "חלב", done: false } },
    { name: 'priority = "urgent"', body: { title: "חלב", priority: "urgent", done: false } },
  ]);
});
test("valid לא משתנה, וכל מקרה הוא אובייקט חדש", async () => {
  const f = await get();
  const valid = { a: 1, b: 2 };
  const cases = f(valid, { a: [null, "x"], b: [] });
  assert.deepEqual(valid, { a: 1, b: 2 }, "valid השתנה");
  assert.equal(cases.length, 4);
  assert.notEqual(cases[1].body, cases[2].body);
  assert.ok(cases.every((c) => c.body !== valid), "מקרה מחזיר את valid עצמו");
  assert.deepEqual(cases[1], { name: "a = null", body: { a: null, b: 2 } });
  assert.deepEqual(cases[3], { name: "בלי b", body: { a: 1 } });
});
test("שדה שלא בגוף התקין, ו־bad ריק", async () => {
  const f = await get();
  assert.throws(() => f({ title: "x" }, { dueDate: ["אתמול"] }), { message: "אין שדה dueDate בגוף התקין" });
  assert.deepEqual(f({ title: "x" }, {}), []);
});
