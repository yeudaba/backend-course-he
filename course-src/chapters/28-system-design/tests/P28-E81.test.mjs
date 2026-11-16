import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { queryAllShards } = await load(import.meta.url, "P28-E81.ts");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const shard = (name, rows, { fail = false, delay = 0 } = {}) => ({
  name,
  calls: [],
  async query(limit) {
    this.calls.push(limit);
    await sleep(delay);
    if (fail) throw new Error(`${name} down`);
    return [...rows].sort((a, b) => b.at - a.at || b.id - a.id).slice(0, limit);
  },
});

test("ממזג, ממיין וחותך", async () => {
  const s1 = shard("s1", [{ id: 1, at: 100 }, { id: 4, at: 400 }, { id: 7, at: 700 }]);
  const s2 = shard("s2", [{ id: 2, at: 200 }, { id: 5, at: 700 }, { id: 8, at: 800 }]);
  const s3 = shard("s3", [{ id: 3, at: 300 }]);
  const r = await queryAllShards([s1, s2, s3], 4);
  assert.deepEqual(r.items.map((x) => x.id), [8, 7, 5, 4]);
  assert.deepEqual(r.failed, []);
  assert.deepEqual([s1.calls, s2.calls, s3.calls], [[4], [4], [4]]);
});
test("במקביל", async () => {
  const shards = Array.from({ length: 5 }, (_, i) => shard(`s${i}`, [{ id: i, at: i }], { delay: 100 }));
  const t0 = performance.now();
  await queryAllShards(shards, 3);
  assert.ok(performance.now() - t0 < 350, "5 shards של 100ms — צריך לקחת כ־100ms, לא 500");
});
test("shard שנכשל — תשובה חלקית", async () => {
  const r = await queryAllShards([shard("a", [{ id: 1, at: 1 }], { fail: true }), shard("b", [{ id: 2, at: 2 }]), shard("c", [], { fail: true })], 10);
  assert.deepEqual(r.items, [{ id: 2, at: 2 }]);
  assert.deepEqual(r.failed, ["a", "c"]);
  await assert.rejects(queryAllShards([shard("a", [], { fail: true }), shard("b", [], { fail: true })], 10));
});
