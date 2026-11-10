import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe, code } from "./_ts.mjs";

const FILE = "P22-E28.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["memoizeAsync"])).memoizeAsync;

// fn מזויפת: סופרת קריאות, ומחזירה Promise שאפשר לפתור/לדחות מבחוץ
function controlled() {
  const pending = [];
  const fn = (arg) =>
    new Promise((resolve, reject) => {
      pending.push({ arg, resolve, reject });
    });
  return { fn, pending };
}

test("עובר בדיקת טיפוסים, והטיפוסים עוברים הלאה", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
  const p = typeProbe(import.meta.url, FILE, `import { memoizeAsync } from "FILE";
const m = memoizeAsync(async (id: number) => ({ id, name: "x" }), { ttlMs: 1000 });
const r: Promise<{ id: number; name: string }> = m(1);
// @ts-expect-error — הארגומנט הוא number
m("1");
`);
  assert.ok(p.ok, p.message);
});
test("קריאות במקביל לאותו מפתח ← fn נקראת פעם אחת", async () => {
  const memoizeAsync = await get();
  let calls = 0;
  const m = memoizeAsync(async (x) => {
    calls++;
    await new Promise((r) => setTimeout(r, 20));
    return x * 2;
  }, { ttlMs: 1000, now: () => 0 });
  const results = await Promise.all([m(5), m(5), m(5), m(6)]);
  assert.deepEqual(results, [10, 10, 10, 12]);
  assert.equal(calls, 2, `fn נקראה ${calls} פעמים — שמור את ה־Promise עצמו במטמון (לא את התוצאה), כדי שקריאות שמגיעות בזמן ההמתנה יקבלו אותו`);
});
test("TTL לפי שעון מוזרק", async () => {
  const memoizeAsync = await get();
  let clock = 1000;
  let calls = 0;
  const m = memoizeAsync(async (x) => ++calls, { ttlMs: 500, now: () => clock });
  assert.equal(await m("a"), 1);
  clock = 1499;
  assert.equal(await m("a"), 1, "עדיין בתוקף");
  clock = 1500;
  assert.equal(await m("a"), 2, "בדיוק אחרי ttlMs — פג תוקף, קוראים שוב");
  clock = 1600;
  assert.equal(await m("a"), 2, "התוקף מתחיל מחדש מהקריאה החדשה");
});
test("שגיאה לא נשמרת במטמון", async () => {
  const memoizeAsync = await get();
  const { fn, pending } = controlled();
  const m = memoizeAsync(fn, { ttlMs: 1000, now: () => 0 });
  const first = m("x");
  const second = m("x");
  assert.equal(pending.length, 1);
  pending[0].reject(new Error("רשת"));
  await assert.rejects(first, { message: "רשת" });
  await assert.rejects(second, { message: "רשת" }, "מי שחיכה לאותה קריאה מקבל את אותה שגיאה");
  const third = m("x");
  assert.equal(pending.length, 2, "אחרי שגיאה, הקריאה הבאה צריכה לנסות שוב (למחוק מהמטמון ב־catch)");
  pending[1].resolve("ok");
  assert.equal(await third, "ok");
});
test("ברירת מחדל: Date.now", async () => {
  const memoizeAsync = await get();
  let calls = 0;
  const m = memoizeAsync(async () => ++calls, { ttlMs: 60_000 });
  await m(1);
  await m(1);
  assert.equal(calls, 1);
});
test("Map ו־closure", () => {
  assert.match(code(import.meta.url, FILE), /new\s+Map\b/, "התרגיל מתרגל Map (פרק 7) בתוך closure (פרק 5)");
});
