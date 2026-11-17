import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { processAll } = await load(import.meta.url, "P26.5-E37.ts");

test("הודעה פגומה לא עוצרת, ואחרי maxAttempts — dead", async () => {
  const order = [];
  const flaky = new Map([["b", 1]]);
  const handler = async (m) => {
    order.push(m.id);
    if (m.id === "bad") throw new Error(`invalid email ${order.length}`);
    if (flaky.get(m.id)) { flaky.set(m.id, flaky.get(m.id) - 1); throw new Error("timeout"); }
  };
  const r = await processAll([{ id: "a" }, { id: "bad" }, { id: "b" }, { id: "c" }], handler, 3);
  assert.deepEqual(r.done, ["a", "c", "b"]);
  assert.deepEqual(r.dead, [{ id: "bad", attempts: 3, error: "invalid email 7" }]);
  assert.deepEqual(order, ["a", "bad", "b", "c", "bad", "b", "bad"], "כישלון — לסוף התור");
});
test("maxAttempts 1, ובלי הודעות", async () => {
  const r = await processAll([{ id: "x" }], async () => { throw new Error("no"); }, 1);
  assert.deepEqual(r, { done: [], dead: [{ id: "x", attempts: 1, error: "no" }] });
  assert.deepEqual(await processAll([], async () => {}, 3), { done: [], dead: [] });
});
