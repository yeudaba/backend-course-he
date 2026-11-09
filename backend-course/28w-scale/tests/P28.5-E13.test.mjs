import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { countPrimesParallel } = await load(import.meta.url, "P28.5-E13.ts");

test("התוצאה נכונה", async () => {
  assert.equal(await countPrimesParallel(100), 25);
  assert.equal(await countPrimesParallel(100000, { threads: 3, chunks: 7 }), 9592);
});
test("ה־event loop ממשיך לרוץ בזמן החישוב", async () => {
  let ticks = 0;
  const timer = setInterval(() => ticks++, 10);
  const t0 = Date.now();
  let n;
  try {
    n = await countPrimesParallel(3_000_000, { threads: 4, chunks: 24 });
  } finally {
    clearInterval(timer);
  }
  const ms = Date.now() - t0;
  assert.equal(n, 216816);
  assert.ok(ticks >= (ms / 10) * 0.5, `${ticks} ticks ב־${ms}ms — ה־event loop נחסם (החישוב רץ ב־main thread?)`);
});
