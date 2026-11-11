import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P28.5-E26.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["TopK"])).TopK;

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("מעט ערכים (פחות מ־k) — ספירה מדויקת, מהגבוה לנמוך ובתיקו לפי השם", async () => {
  const TopK = await get();
  const t = new TopK(5);
  for (const x of ["b", "a", "b", "c", "a", "b"]) t.add(x);
  assert.deepEqual(t.top(), [
    { item: "b", count: 3, error: 0 },
    { item: "a", count: 2, error: 0 },
    { item: "c", count: 1, error: 0 },
  ]);
  assert.deepEqual(t.top(2).map((x) => x.item), ["b", "a"], "top(n) — רק n הראשונים");
  assert.equal(t.seen, 6, "seen — כמה פריטים נכנסו בסך הכול");
});
test("החלפה: החדש יורש את הספירה של הקטן ביותר, + 1", async () => {
  const TopK = await get();
  const t = new TopK(2);
  for (const x of ["a", "a", "b", "c"]) t.add(x);
  assert.deepEqual(t.top(), [
    { item: "a", count: 2, error: 0 },
    { item: "c", count: 2, error: 1 },
  ], "c החליף את b (ספירה 1): count = 1 + 1, error = 1");
  t.add("d");
  const after = t.top();
  assert.deepEqual(after[0], { item: "d", count: 3, error: 2 }, "המינימום היה 2 (תיקו בין a ל־c — מחליפים אחד מהם)");
  assert.equal(after.length, 2);
  assert.equal(after[0].count + after[1].count, 5, "סכום המונים = כמה פריטים נכנסו");
});
test("זרם גדול: הכבדים תמיד נמצאים, והספירה חוסמת את האמת משני הצדדים", async () => {
  const TopK = await get();
  let seed = 7;
  const rand = () => ((seed = (seed * 48271) % 2147483647) / 2147483647);
  const k = 30;
  const t = new TopK(k);
  const truth = new Map();
  const N = 60_000;
  for (let i = 0; i < N; i++) {
    const r = rand();
    const x = r < 0.15 ? "hot-1" : r < 0.25 ? "hot-2" : r < 0.3 ? "hot-3" : `cold-${Math.floor(rand() * 20_000)}`;
    t.add(x);
    truth.set(x, (truth.get(x) ?? 0) + 1);
  }
  const top = t.top();
  assert.ok(top.length <= k, "לכל היותר k מונים");
  const items = top.map((x) => x.item);
  for (const [x, c] of truth) if (c > N / k) assert.ok(items.includes(x), `${x} הופיע ${c} פעמים (יותר מ־N/k) — חייב להיות ברשימה`);
  assert.deepEqual(items.slice(0, 3), ["hot-1", "hot-2", "hot-3"]);
  for (const { item, count, error } of top) {
    const real = truth.get(item);
    assert.ok(count >= real, `${item}: count ${count} קטן מהאמת ${real}`);
    assert.ok(count - error <= real, `${item}: count - error = ${count - error} גדול מהאמת ${real}`);
  }
  assert.equal(top.reduce((s, x) => s + x.count, 0), N, "סכום כל המונים = כמה פריטים נכנסו (כשהזיכרון מלא)");
});
test("k לא תקין ← RangeError, ושדות פרטיים", async () => {
  const TopK = await get();
  for (const bad of [0, -1, 2.5]) assert.throws(() => new TopK(bad), RangeError, String(bad));
  assert.deepEqual(Object.keys(new TopK(3)), []);
});
