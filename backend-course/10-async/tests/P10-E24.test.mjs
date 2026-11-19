import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { mapLimit } = await load(import.meta.url, "P10-E24.js");
const sleep = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));
const failAfter = (ms, m) => new Promise((_, rej) => setTimeout(() => rej(new Error(m)), ms));

test("תוצאות בסדר ובמגבלה", async () => {
  let active = 0, max = 0;
  const r = await mapLimit([5, 1, 4, 2, 3, 1], 2, async (n, i) => { active++; max = Math.max(max, active); await sleep(n * 5); active--; return `${i}:${n}`; });
  assert.deepEqual(r, ["0:5", "1:1", "2:4", "3:2", "4:3", "5:1"]);
  assert.equal(max, 2);
});
test("מנצל את המגבלה (לא במנות)", async () => {
  // limit 2: פריט 0 לוקח 60ms ופריט 1 לוקח 10ms. ברגע שפריט 1 מסתיים, פריט 2 צריך להתחיל — בלי לחכות לפריט 0
  const log = [];
  await mapLimit([60, 10, 10, 10, 10], 2, async (ms, i) => { log.push(`start ${i}`); await sleep(ms); log.push(`end ${i}`); });
  assert.ok(log.indexOf("start 2") < log.indexOf("end 0"), `פריט 2 התחיל רק אחרי שפריט 0 הסתיים — זו עבודה במנות ("${log.join(", ")}"). כל עובד צריך לקחת פריט חדש ברגע שהוא מתפנה`);
});
test("כישלון של fn — mapLimit נדחית עם השגיאה", async () => {
  await assert.rejects(mapLimit([1, 2, 3], 2, async (x) => { await sleep(5); if (x === 2) throw new Error("boom"); return x; }), /boom/, "אל תבלע את השגיאה — המשימה: כישלון ← נזרק");
});
test("ריק ו־limit גדול", async () => { assert.deepEqual(await mapLimit([], 3, async (x) => x), []); assert.deepEqual(await mapLimit([1, 2], 10, async (x) => x * 2), [2, 4]); });
