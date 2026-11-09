import { test } from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";
import { setTimeout as sleep } from "node:timers/promises";
import { load } from "../../tools/load.mjs";

const { importEvents } = await load(import.meta.url, "P28.5-E20.ts");
const chunked = (text, size) => {
  const b = Buffer.from(text);
  const out = [];
  for (let i = 0; i < b.length; i += size) out.push(b.subarray(i, i + size));
  return Readable.from(out);
};
const text = ['{"id":1,"city":"תל אביב"}', '{"id":2,"city":"באר שבע"}', '{"id":3,"city":"חיפה"}'].join("\n");

test("באג 1: שורות ותווים שנחתכו בין chunks", async () => {
  const got = [];
  await importEvents(chunked(text + "\n", 5), async (e) => void got.push(e));
  assert.deepEqual(got.map((e) => e.city), ["תל אביב", "באר שבע", "חיפה"]);
});
test("באג 2: שורה אחרונה בלי \\n", async () => {
  const got = [];
  assert.equal(await importEvents(chunked(text, 1000), async (e) => void got.push(e.id)), 3);
  assert.deepEqual(got, [1, 2, 3]);
});
test("באג 3: מחכים ל־onEvent — אחד בכל פעם, ושגיאה עולה", async () => {
  let now = 0;
  let peak = 0;
  await importEvents(chunked(text + "\n", 1000), async () => {
    peak = Math.max(peak, ++now);
    await sleep(20);
    now--;
  });
  assert.equal(peak, 1, `${peak} אירועים טופלו במקביל — אין backpressure`);
  await assert.rejects(importEvents(chunked(text + "\n", 1000), async (e) => {
    if (e.id === 2) throw new Error("db down");
  }), /db down/);
});
