import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { mapInChunks } = await load(import.meta.url, "P28.5-E47.ts");

test("כמו map", async () => {
  assert.deepEqual(await mapInChunks([1, 2, 3, 4, 5], (x, i) => x * 10 + i, 2), [10, 21, 32, 43, 54]);
  assert.deepEqual(await mapInChunks([], (x) => x), []);
});
test("משחרר את ה־event loop בין חתיכות", async () => {
  const items = Array.from({ length: 10_000 }, (_, i) => i);
  let ticks = 0;
  const seen = [];
  const timer = setInterval(() => ticks++, 0);
  let r;
  try {
    r = await mapInChunks(items, (x) => {
      if (x % 1000 === 0) seen.push(ticks);
      const t0 = performance.now();
      while (performance.now() - t0 < 0.05);
      return x;
    }, 1000);
  } finally {
    clearInterval(timer);
  }
  assert.equal(r.length, 10_000);
  assert.ok(new Set(seen).size >= 5, `ה־timer רץ רק ${new Set(seen).size} פעמים בין החתיכות — setImmediate בין חתיכות?`);
});
test("עם await null — לא מספיק", async () => {
  let immediates = 0;
  const p = mapInChunks(Array.from({ length: 300 }, (_, i) => i), (x) => x, 100);
  setImmediate(() => immediates++);
  await p;
  assert.equal(immediates, 1);
});
test("שגיאות", async () => {
  await assert.rejects(mapInChunks([1, 2, 3], (x) => { if (x === 2) throw new Error("bad 2"); return x; }), /bad 2/);
  await assert.rejects(mapInChunks([1], (x) => x, 0), RangeError);
  await assert.rejects(mapInChunks([1], (x) => x, 1.5), RangeError);
});
