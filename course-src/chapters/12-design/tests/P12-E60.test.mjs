import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe } from "./_ts.mjs";

const FILE = "P12-E60.ts";
const get = () => exportsOf(import.meta.url, FILE, ["SystemClock", "FakeClock", "isExpired"]);

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("החוזה Clock", () => {
  const r = typeProbe(import.meta.url, FILE, `import { SystemClock, FakeClock, isExpired } from "FILE";
import type { Clock } from "FILE";
const a: Clock = new SystemClock();
const b: Clock = new FakeClock(5);
const c: Clock = { now: () => 42 };
const e: boolean = isExpired(10, c);
// @ts-expect-error — Clock חייב now
const bad: Clock = {};
export { a, b, e, bad };
`);
  assert.ok(r.ok, r.message);
});
test("FakeClock", async () => {
  const { FakeClock } = await get();
  const c = new FakeClock(1000);
  assert.equal(c.now(), 1000);
  c.advance(500);
  c.advance(0);
  assert.equal(c.now(), 1500);
  assert.equal(new FakeClock().now(), 0, "ברירת מחדל: 0");
  assert.throws(() => c.advance(-1), (e) => e instanceof RangeError && e.message === "אי אפשר לחזור בזמן");
  assert.equal(c.now(), 1500);
  assert.deepEqual(Object.keys(c), [], "הזמן צריך להיות בשדה פרטי (#)");
});
test("SystemClock ו־isExpired", async () => {
  const { SystemClock, FakeClock, isExpired } = await get();
  const before = Date.now();
  const t = new SystemClock().now();
  assert.ok(t >= before && t <= Date.now() + 1, "SystemClock.now() צריכה להחזיר Date.now()");
  const c = new FakeClock(100);
  assert.equal(isExpired(200, c), false);
  c.advance(100);
  assert.equal(isExpired(200, c), true, "בדיוק ב־expiresAt — כבר פג");
  assert.equal(isExpired(50, { now: () => 49 }), false, "isExpired צריכה להשתמש בשעון שקיבלה");
});
