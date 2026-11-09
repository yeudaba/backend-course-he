import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { reservoirSample } = await load(import.meta.url, "P28.5-E19.ts");
const seeded = (s) => () => ((s = (s * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);

test("k פריטים שונים מתוך הזרם", async () => {
  const s = await reservoirSample(Array.from({ length: 1000 }, (_, i) => i), 10, seeded(1));
  assert.equal(s.length, 10);
  assert.equal(new Set(s).size, 10);
  assert.ok(s.every((x) => x >= 0 && x < 1000));
});
test("זרם קצר מ־k ← כולו", async () => {
  assert.deepEqual(await reservoirSample([1, 2, 3], 5), [1, 2, 3]);
});
test("עובד על async iterable (שורות מקובץ, הודעות מ־Kafka)", async () => {
  async function* gen() {
    for (let i = 0; i < 500; i++) yield { id: i };
  }
  const s = await reservoirSample(gen(), 5, seeded(9));
  assert.equal(s.length, 5);
});
test("אחיד: כל פריט נבחר בסיכוי k/n", async () => {
  const counts = Array(10).fill(0);
  const rng = seeded(42);
  for (let trial = 0; trial < 5000; trial++) for (const x of await reservoirSample([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 2, rng)) counts[x]++;
  for (const c of counts) assert.ok(c > 850 && c < 1150, `ספירות: ${counts}`); // ציפייה: 1000
});
test("k לא תקין", async () => {
  await assert.rejects(reservoirSample([1], 0));
});
