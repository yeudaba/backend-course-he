import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe, code } from "./_ts.mjs";

const FILE = "P11-E75.ts";
const get = () => exportsOf(import.meta.url, FILE, ["parseTodo"]);

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("הטיפוסים", () => {
  const r = typeProbe(import.meta.url, FILE, `import { parseTodo } from "FILE";
import type { Todo } from "FILE";
const a: Todo = { title: "x", done: false };
const b: Todo = { title: "x", done: true, priority: "low" };
// @ts-expect-error — priority רק low או high
const c: Todo = { title: "x", done: true, priority: "urgent" };
const r = parseTodo("{}");
// @ts-expect-error — parseTodo יכולה להחזיר null
const sure: Todo = r;
export { a, b, c, sure };
`);
  assert.ok(r.ok, r.message);
});
test("תקינים — אובייקט חדש בלי שדות נוספים", async () => {
  const { parseTodo } = await get();
  assert.deepEqual(parseTodo('{"title": "לקנות חלב", "done": false}'), { title: "לקנות חלב", done: false });
  assert.deepEqual(parseTodo('{"title": "x", "done": true, "priority": "high", "extra": 1}'), { title: "x", done: true, priority: "high" }, "שדות נוספים לא עוברים");
  assert.deepEqual(parseTodo('{"done": true, "title": " y ", "priority": "low"}'), { title: " y ", done: true, priority: "low" });
  const r = parseTodo('{"title": "a", "done": false}');
  assert.ok(r && !("priority" in r), "בלי priority בקלט — בלי השדה בתוצאה");
});
test("לא תקינים ← null", async () => {
  const { parseTodo } = await get();
  const bad = [
    '{"title": "x", "done": "no"}',
    '{"title": "x", "done": true, "priority": "urgent"}',
    '{"title": "x", "done": true, "priority": null}',
    '{"title": "   ", "done": true}',
    '{"title": 5, "done": true}',
    '{"done": true}',
    '{"title": "x"}',
    "[]",
    "null",
    '"x"',
    "{oops",
    "",
  ];
  for (const json of bad) assert.equal(parseTodo(json), null, `parseTodo(${JSON.stringify(json)})`);
});
test("בלי any ובלי as", () => {
  const src = code(import.meta.url, FILE);
  assert.ok(!/\bany\b/.test(src), "בלי any");
  assert.ok(!/\bas\s+[A-Za-z{[(]/.test(src), "בלי as — narrowing בלבד");
});
