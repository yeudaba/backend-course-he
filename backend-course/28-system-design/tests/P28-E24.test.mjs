import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { createIdGenerator, parseId } = await load(import.meta.url, "P28-E24.ts");

test("מבנה: זמן | worker | מונה", () => {
  const t = Date.parse("2026-11-08T10:00:00.000Z");
  const g = createIdGenerator(7, { now: () => t });
  const a = g.next();
  const b = g.next();
  assert.equal(typeof a, "bigint");
  assert.deepEqual(parseId(a), { time: "2026-11-08T10:00:00.000Z", workerId: 7, seq: 0 });
  assert.deepEqual(parseId(b), { time: "2026-11-08T10:00:00.000Z", workerId: 7, seq: 1 });
});
test("עולה, ייחודי, ובין workers לא מתנגש", () => {
  let t = Date.parse("2026-11-08T10:00:00.000Z");
  const g1 = createIdGenerator(1, { now: () => t });
  const g2 = createIdGenerator(2, { now: () => t });
  const ids = [];
  for (let i = 0; i < 3000; i++) {
    if (i % 1000 === 0) t++;
    ids.push(g1.next(), g2.next());
  }
  assert.equal(new Set(ids).size, ids.length);
  const own = ids.filter((_, i) => i % 2 === 0);
  for (let i = 1; i < own.length; i++) assert.ok(own[i] > own[i - 1], "עולה");
});
test("4096 באותה מילישנייה ← מחכה לבאה", () => {
  let t = Date.parse("2026-11-08T10:00:00.000Z");
  let reads = 0;
  const g = createIdGenerator(0, { now: () => (++reads > 4097 ? t + 1 : t) });
  let last;
  for (let i = 0; i < 4097; i++) last = g.next();
  assert.deepEqual(parseId(last), { time: "2026-11-08T10:00:00.001Z", workerId: 0, seq: 0 });
});
test("שעון שחזר אחורה ← שגיאה; workerId לא תקין ← שגיאה", () => {
  let t = Date.parse("2026-11-08T10:00:00.000Z");
  const g = createIdGenerator(3, { now: () => t });
  g.next();
  t -= 5;
  assert.throws(() => g.next(), /5/);
  assert.throws(() => createIdGenerator(1024));
  assert.throws(() => createIdGenerator(-1));
});
