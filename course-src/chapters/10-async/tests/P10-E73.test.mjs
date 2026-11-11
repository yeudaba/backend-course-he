import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";
import { tmpFiles } from "./_cb.mjs";

const get = () => exportsOf(import.meta.url, "P10-E73.js", ["sumFile"]);
const t = tmpFiles({
  "a.txt": "10\n 2.5\n\n7\n",
  "b.txt": "  \n-3\n3\n   \n100",
  "empty.txt": "",
  "bad.txt": "1\n\n 2 \nשלוש \n4",
  "bad2.txt": "5\n12abc",
});

test("סכום, עם שורות ריקות ורווחים", async () => {
  const { sumFile } = await get();
  const p = sumFile(t.p("a.txt"));
  assert.ok(p instanceof Promise, "sumFile צריכה להחזיר Promise");
  assert.equal(await p, 19.5);
  assert.equal(await sumFile(t.p("b.txt")), 100);
  assert.equal(await sumFile(t.p("empty.txt")), 0);
});
test("שורה לא מספרית ← הודעה עם מספר השורה והתוכן", async () => {
  const { sumFile } = await get();
  await assert.rejects(sumFile(t.p("bad.txt")), { message: 'שורה 4: "שלוש" אינו מספר' });
  await assert.rejects(sumFile(t.p("bad2.txt")), { message: 'שורה 2: "12abc" אינו מספר' });
});
test("קובץ שלא קיים ← השגיאה המקורית", async () => {
  const { sumFile } = await get();
  await assert.rejects(sumFile(t.p("nope.txt")), (e) => e.code === "ENOENT");
});
test("then בלבד", () => {
  assert.ok(!/\bawait\b|\basync\b/.test(code(import.meta.url, "P10-E73.js")), "בתרגיל הזה — then, בלי async/await");
});
