import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = () => exportsOf(import.meta.url, "P10-E38.js", ["inChunks"]);

function run(inChunks, items, size, { other = false } = {}) {
  return new Promise((resolve) => {
    const log = [];
    let done = 0;
    inChunks(items, size, (x) => log.push(x), () => {
      done++;
      log.push("done");
      setTimeout(() => resolve({ log, done }), 20);
    });
    if (other) setTimeout(() => log.push("other"), 0);
    log.push("sync-end");
    setTimeout(() => resolve({ log, done }), 300);
  });
}

test("כל הפריטים לפי הסדר, ו־done פעם אחת", async () => {
  const { inChunks } = await get();
  const { log, done } = await run(inChunks, [1, 2, 3, 4, 5, 6, 7], 3);
  assert.equal(done, 1, `done נקראה ${done} פעמים`);
  assert.deepEqual(log, ["sync-end", 1, 2, 3, 4, 5, 6, 7, "done"], "גם החתיכה הראשונה צריכה לרוץ בטיימר — אחרי שהקוד הנוכחי הסתיים");
});
test("טיימר אחר נכנס בין החתיכות", async () => {
  const { inChunks } = await get();
  const { log } = await run(inChunks, ["a", "b", "c", "d", "e"], 2, { other: true });
  assert.deepEqual(log, ["sync-end", "a", "b", "other", "c", "d", "e", "done"], "הטיימר האחר צריך לרוץ אחרי החתיכה הראשונה — רשום כל חתיכה רק אחרי שהקודמת רצה");
});
test("size גדול מהמערך, ומערך ריק", async () => {
  const { inChunks } = await get();
  assert.deepEqual((await run(inChunks, [1, 2], 10)).log, ["sync-end", 1, 2, "done"]);
  const empty = await run(inChunks, [], 3);
  assert.equal(empty.done, 1, "גם עם מערך ריק done נקראת");
  assert.deepEqual(empty.log, ["sync-end", "done"]);
});
