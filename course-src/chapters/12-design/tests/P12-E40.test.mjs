import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe } from "./_ts.mjs";

const FILE = "P12-E40.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["TaskQueue"])).TaskQueue;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("add מחזירה Promise מהסוג של המשימה", () => {
  const r = typeProbe(import.meta.url, FILE, `import { TaskQueue } from "FILE";
const q = new TaskQueue();
const p: Promise<number> = q.add(async () => 5);
const s: Promise<string> = q.add(async () => "x");
// @ts-expect-error — משימה שמחזירה מספר לא נותנת Promise<string>
const wrong: Promise<string> = q.add(async () => 5);
const n: number = q.pending;
export { p, s, wrong, n };
`);
  assert.ok(r.ok, r.message);
});
test("אחת אחרי השנייה, עם התוצאות הנכונות", async () => {
  const TaskQueue = await get();
  const q = new TaskQueue();
  const log = [];
  const task = (name, ms) => async () => {
    log.push(`start ${name}`);
    await sleep(ms);
    log.push(`end ${name}`);
    return name;
  };
  const results = await Promise.all([q.add(task("a", 30)), q.add(task("b", 5)), q.add(task("c", 1))]);
  assert.deepEqual(results, ["a", "b", "c"]);
  assert.deepEqual(log, ["start a", "end a", "start b", "end b", "start c", "end c"], "משימה מתחילה רק אחרי שהקודמת הסתיימה");
});
test("כישלון עובר למי שהוסיף — והתור ממשיך", async () => {
  const TaskQueue = await get();
  const q = new TaskQueue();
  const ran = [];
  const a = q.add(async () => { await sleep(5); throw new Error("נכשל"); });
  const b = q.add(async () => { ran.push("b"); return 2; });
  await assert.rejects(a, { message: "נכשל" });
  assert.equal(await b, 2, "משימה אחרי משימה שנכשלה צריכה לרוץ");
  assert.deepEqual(ran, ["b"]);
  assert.equal(await q.add(async () => 3), 3);
});
test("pending", async () => {
  const TaskQueue = await get();
  const q = new TaskQueue();
  assert.equal(q.pending, 0);
  const a = q.add(() => sleep(20));
  const b = q.add(async () => { throw new Error("x"); });
  const c = q.add(() => sleep(1));
  assert.equal(q.pending, 3);
  await a;
  await b.catch(() => {});
  assert.ok(q.pending <= 1, `אחרי ששתי הראשונות הסתיימו pending הוא ${q.pending}`);
  await c;
  await sleep(1);
  assert.equal(q.pending, 0, "כולל משימה שנכשלה — כשהסתיימה היא לא pending");
});
test("משימה אחת רצה בכל רגע", async () => {
  const TaskQueue = await get();
  const q = new TaskQueue();
  let active = 0;
  let max = 0;
  const t = async () => { active++; max = Math.max(max, active); await sleep(3); active--; };
  await Promise.all([q.add(t), q.add(t), q.add(t), q.add(t)]);
  assert.equal(max, 1, `רצו ${max} משימות בו־זמנית`);
});
