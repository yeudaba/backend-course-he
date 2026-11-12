import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { processBatch } = await load(import.meta.url, "P26.5-E76.ts");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test("לכל היותר concurrency, בלי גלים, וסדר הקלט בתוצאה", async () => {
  const msgs = Array.from({ length: 10 }, (_, i) => ({ MessageId: `m${i}`, ms: i === 0 ? 300 : 30 }));
  let active = 0, max = 0;
  const finishedAt = {};
  const start = Date.now();
  const r = await processBatch(msgs, async (m) => {
    active++; max = Math.max(max, active);
    await sleep(m.ms);
    active--;
    finishedAt[m.MessageId] = Date.now() - start;
    if (m.MessageId === "m4" || m.MessageId === "m7") throw new Error("bad");
  }, 3);
  assert.equal(max, 3);
  assert.deepEqual(r.ok, ["m0", "m1", "m2", "m3", "m5", "m6", "m8", "m9"]);
  assert.deepEqual(r.failed, ["m4", "m7"]);
  assert.ok(finishedAt.m9 < 280, `m9 הסתיימה ב־${finishedAt.m9}ms — הודעה איטית אחת לא עוצרת את כולן`);
});
test("concurrency גדול מהכמות, ובלי הודעות", async () => {
  assert.deepEqual(await processBatch([{ MessageId: "a" }], async () => {}, 10), { ok: ["a"], failed: [] });
  assert.deepEqual(await processBatch([], async () => {}, 3), { ok: [], failed: [] });
});
