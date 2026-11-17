import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { exportsOf, code } from "./_src.mjs";
import { tmpFiles } from "./_cb.mjs";

const get = () => exportsOf(import.meta.url, "P10-E72.js", ["promisify"]);
const t = tmpFiles({ "a.txt": "תוכן" });

test("פונקציה עם שני ארגומנטים", async () => {
  const { promisify } = await get();
  const addLater = (a, b, cb) => setTimeout(() => cb(null, a + b), 5);
  const add = promisify(addLater);
  assert.equal(typeof add, "function", "promisify צריכה להחזיר פונקציה");
  const p = add(2, 3);
  assert.ok(p instanceof Promise, "הפונקציה שמוחזרת צריכה להחזיר Promise");
  assert.equal(await p, 5);
  assert.equal(await add(10, -1), 9);
});
test("כמה ארגומנטים שיהיו — ה־callback תמיד אחרון", async () => {
  const { promisify } = await get();
  const seen = [];
  const f = promisify((...args) => {
    const cb = args.pop();
    seen.push(args);
    setTimeout(() => cb(null, args.length), 1);
  });
  assert.equal(await f(), 0);
  assert.equal(await f("a", "b", "c", "d"), 4);
  assert.deepEqual(seen, [[], ["a", "b", "c", "d"]]);
});
test("שגיאה ← reject עם אותה שגיאה", async () => {
  const { promisify } = await get();
  const err = new Error("נכשל");
  await assert.rejects(promisify((cb) => setTimeout(() => cb(err), 1))(), (e) => e === err);
});
test("עובד עם fs.readFile אמיתי", async () => {
  const { promisify } = await get();
  const readFile = promisify(fs.readFile);
  assert.equal(await readFile(t.p("a.txt"), "utf8"), "תוכן");
  await assert.rejects(readFile(t.p("nope"), "utf8"), (e) => e.code === "ENOENT");
});
test("בלי util.promisify", () => {
  assert.ok(!/util/.test(code(import.meta.url, "P10-E72.js")), "המטרה לכתוב בעצמך — בלי util.promisify");
});
