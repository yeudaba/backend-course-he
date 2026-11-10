import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, code } from "./_ts.mjs";

const FILE = "P21-E28.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["TokenBlocklist"])).TokenBlocklist;

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("block ו־isBlocked לפי שעון מוזרק", async () => {
  const TokenBlocklist = await get();
  let now = 1000;
  const list = new TokenBlocklist(() => now);
  list.block("a", 1900);
  assert.equal(list.isBlocked("a"), true);
  assert.equal(list.isBlocked("zzz"), false);
  assert.equal(list.size, 1, "size הוא getter");
  now = 1899;
  assert.equal(list.isBlocked("a"), true);
  now = 1900;
  assert.equal(list.isBlocked("a"), false, "ב־exp הטוקן כבר פג — הוא ממילא לא יעבור, אין צורך לחסום");
});
test("טוקן שכבר פג — לא נשמר", async () => {
  const TokenBlocklist = await get();
  const list = new TokenBlocklist(() => 1000);
  list.block("old", 900);
  list.block("now", 1000);
  assert.equal(list.size, 0, "אין טעם לשמור טוקן שתוקפו כבר עבר — הרשימה רק תגדל");
});
test("cleanup מוחק רק את מה שפג, ומחזיר כמה", async () => {
  const TokenBlocklist = await get();
  let now = 1000;
  const list = new TokenBlocklist(() => now);
  list.block("a", 1100);
  list.block("b", 1200);
  list.block("c", 5000);
  now = 1200;
  assert.equal(list.cleanup(), 2);
  assert.equal(list.size, 1);
  assert.equal(list.isBlocked("c"), true);
  assert.equal(list.cleanup(), 0);
});
test("שעון ברירת מחדל בשניות, והנתונים פרטיים", async () => {
  const TokenBlocklist = await get();
  const list = new TokenBlocklist();
  const nowSec = Math.floor(Date.now() / 1000);
  list.block("x", nowSec + 60);
  assert.equal(list.isBlocked("x"), true, "ברירת המחדל: Math.floor(Date.now() / 1000) — exp של JWT בשניות, לא במילישניות");
  assert.deepEqual(Object.keys(list), [], `יש שדות ציבוריים (${Object.keys(list).join(", ")}) — השתמש ב־#`);
  const other = new TokenBlocklist();
  assert.equal(other.isBlocked("x"), false, "שתי רשימות נפרדות");
});
test("Map", () => {
  assert.match(code(import.meta.url, FILE), /new\s+Map\b/, "התרגיל מתרגל Map (פרק 7): jti ← exp");
});
