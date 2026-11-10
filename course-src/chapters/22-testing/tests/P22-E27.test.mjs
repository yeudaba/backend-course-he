import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe, code } from "./_ts.mjs";

const FILE = "P22-E27.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["LruCache"])).LruCache;

test("עובר בדיקת טיפוסים, ו־LruCache הוא generic", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
  const p = typeProbe(import.meta.url, FILE, `import { LruCache } from "FILE";
const c = new LruCache<string, number>(2);
c.set("a", 1);
const v: number | undefined = c.get("a");
const n: number = c.size;
const k: string[] = c.keys();
// @ts-expect-error — הערכים הם number
c.set("b", "two");
// @ts-expect-error — get יכול להחזיר undefined
const w: number = c.get("a");
`);
  assert.ok(p.ok, p.message);
});
test("set ו־get, ומפתח שלא קיים", async () => {
  const LruCache = await get();
  const c = new LruCache(3);
  c.set("a", 1);
  c.set("b", 2);
  assert.equal(c.get("a"), 1);
  assert.equal(c.get("zzz"), undefined);
  assert.equal(c.size, 2, "size הוא getter");
});
test("כשאין מקום — יוצא זה שלא נגעו בו הכי הרבה זמן", async () => {
  const LruCache = await get();
  const c = new LruCache(2);
  c.set("a", 1);
  c.set("b", 2);
  c.set("c", 3);
  assert.deepEqual(c.keys(), ["b", "c"], "a נכנס ראשון ולא נגעו בו — הוא יוצא");
  c.get("b");
  c.set("d", 4);
  assert.deepEqual(c.keys(), ["b", "d"], "get(\"b\") הפך אותו לאחרון שנגעו בו — c יוצא");
  assert.equal(c.get("c"), undefined);
});
test("set למפתח קיים — מעדכן, לא מוחק אחר, ומזיז לסוף", async () => {
  const LruCache = await get();
  const c = new LruCache(2);
  c.set("a", 1);
  c.set("b", 2);
  c.set("a", 10);
  assert.equal(c.size, 2);
  assert.deepEqual(c.keys(), ["b", "a"], "עדכון הוא גם \"נגיעה\"");
  c.set("c", 3);
  assert.deepEqual(c.keys(), ["a", "c"]);
  assert.equal(c.get("a"), 10);
});
test("ערכים falsy נשמרים", async () => {
  const LruCache = await get();
  const c = new LruCache(2);
  c.set("zero", 0);
  c.set("empty", "");
  assert.equal(c.get("zero"), 0, "0 הוא ערך אמיתי — has ולא if (value)");
  assert.equal(c.get("empty"), "");
  assert.deepEqual(c.keys(), ["zero", "empty"], "גם get על ערך falsy מזיז לסוף");
});
test("capacity לא תקין, ונתונים פרטיים", async () => {
  const LruCache = await get();
  for (const bad of [0, -1, 1.5]) assert.throws(() => new LruCache(bad), (e) => e instanceof RangeError && e.message === "capacity חייב להיות מספר שלם חיובי", `capacity ${bad}`);
  const c = new LruCache(1);
  assert.deepEqual(Object.keys(c), [], `יש שדות ציבוריים (${Object.keys(c).join(", ")}) — השתמש ב־#`);
});
test("Map", () => {
  const src = code(import.meta.url, FILE);
  assert.match(src, /new\s+Map\b/, "התרגיל מתרגל Map (פרק 7) — הסדר של Map הוא סדר ההכנסה");
  assert.doesNotMatch(src, /\.(indexOf|splice|shift)\s*\(/, "בלי מערך נוסף לסדר — ה־Map כבר שומר אותו");
});
