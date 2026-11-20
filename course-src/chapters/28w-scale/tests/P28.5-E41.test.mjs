import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { createTimer } = await load(import.meta.url, "P28.5-E41.ts");

test("מודד הצלחות וכישלונות, ומחזיר אותה תוצאה", async () => {
  let clock = 0;
  const { timed, summary } = createTimer(() => clock);
  const work = timed("db", async (ms, fail) => {
    await new Promise((r) => setTimeout(r, 1));
    clock += ms;
    if (fail) throw new Error("boom");
    return ms * 2;
  });
  for (let i = 1; i <= 99; i++) assert.equal(await work(i, false), i * 2);
  await assert.rejects(work(500, true), /boom/);
  const other = timed("redis", async () => { clock += 1; return "ok"; });
  assert.equal(await other(), "ok");
  assert.deepEqual(summary(), { db: { count: 100, errors: 1, p50: 50, p99: 99 }, redis: { count: 1, errors: 0, p50: 1, p99: 1 } });
});
test("זמן אמיתי — אחרי שה־Promise הסתיים", async () => {
  const { timed, summary } = createTimer();
  const slow = timed("slow", () => new Promise((r) => setTimeout(() => r(1), 60)));
  await slow();
  const s = summary().slow;
  assert.equal(s.count, 1);
  assert.ok(s.p50 >= 50, `נמדדו ${s.p50}ms — await בתוך try?`);
});
test("טיימרים נפרדים", () => {
  const a = createTimer(() => 0);
  const b = createTimer(() => 0);
  a.timed("x", async () => 1);
  assert.deepEqual(b.summary(), {});
});
test("percentile אחרי מיון — גם כשהזמנים לא מגיעים לפי הסדר", async () => {
  let clock = 0;
  const { timed, summary } = createTimer(() => clock);
  const work = timed("x", async (ms) => { clock += ms; });
  for (const ms of [10, 90, 70, 30, 50]) await work(ms);
  assert.equal(summary().x.p50, 50);
});
