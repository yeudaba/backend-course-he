import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe, code } from "./_ts.mjs";

const FILE = "P11-E83.ts";
const get = () => exportsOf(import.meta.url, FILE, ["changedFields"]);

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("החתימה: רק שמות של שדות", () => {
  const r = typeProbe(import.meta.url, FILE, `import { changedFields } from "FILE";
type User = { id: number; name: string; email: string };
const u: User = { id: 1, name: "a", email: "b" };
const r: ("id" | "name" | "email")[] = changedFields(u, u, ["name", "email"]);
// @ts-expect-error — "phone" הוא לא שדה של User
changedFields(u, u, ["phone"]);
// @ts-expect-error — התוצאה היא שמות של שדות, לא כל מחרוזת
const s: "name"[] = changedFields(u, u, ["name"]);
export { r, s };
`);
  assert.ok(r.ok, r.message);
});
test("מחזיר רק את השדות שהשתנו, לפי הסדר", async () => {
  const { changedFields } = await get();
  const before = { id: 1, name: "דנה", email: "d@x.com", age: 30 };
  assert.deepEqual(changedFields(before, { ...before, name: "דנה כהן" }, ["name", "email"]), ["name"]);
  assert.deepEqual(changedFields(before, { ...before, email: "e", age: 31 }, ["age", "id", "email"]), ["age", "email"]);
  assert.deepEqual(changedFields(before, { ...before }, ["id", "name", "email", "age"]), []);
  assert.deepEqual(changedFields(before, { ...before, name: "x" }, []), []);
});
test("השוואה עם !== (0 שונה מ־\"0\")", async () => {
  const { changedFields } = await get();
  assert.deepEqual(changedFields({ v: 0 }, { v: "0" }, ["v"]), ["v"]);
  assert.deepEqual(changedFields({ v: null }, { v: undefined }, ["v"]), ["v"]);
});
test("בלי any ובלי as", () => {
  const src = code(import.meta.url, FILE);
  assert.ok(!/\bany\b/.test(src), "בלי any");
  assert.ok(!/\bas\s+[A-Za-z{[(]/.test(src), "בלי as");
});
