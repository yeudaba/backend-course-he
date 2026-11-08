import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { createBatcher } = await load(import.meta.url, "P28-E18.ts");
const users = new Map([[1, "dana"], [2, "yossi"], [3, "noa"]]);
function loader() {
  const calls = [];
  const loadMany = async (ids) => { calls.push([...ids]); return new Map(ids.filter((id) => users.has(id)).map((id) => [id, users.get(id)])); };
  return { calls, loadMany };
}

test("בקשות באותו tick ← קריאה אחת, בלי כפילויות", async () => {
  const { calls, loadMany } = loader();
  const get = createBatcher(loadMany);
  const r = await Promise.all([get(1), get(2), get(1), get(3), get(9)]);
  assert.deepEqual(r, ["dana", "yossi", "dana", "noa", undefined]);
  assert.deepEqual(calls, [[1, 2, 3, 9]]);
});
test("maxBatch — מתחלק", async () => {
  const { calls, loadMany } = loader();
  const get = createBatcher(loadMany, { maxBatch: 2 });
  await Promise.all([get(1), get(2), get(3)]);
  assert.deepEqual(calls, [[1, 2], [3]]);
});
test("בקשות בזמנים שונים ← קריאות נפרדות", async () => {
  const { calls, loadMany } = loader();
  const get = createBatcher(loadMany);
  await get(1);
  await get(2);
  assert.deepEqual(calls, [[1], [2]]);
});
test("שגיאה ב־loadMany ← כל הבקשות של ה־batch נכשלות", async () => {
  const get = createBatcher(async () => { throw new Error("db down"); });
  const results = await Promise.allSettled([get(1), get(2)]);
  assert.deepEqual(results.map((r) => r.status), ["rejected", "rejected"]);
});
