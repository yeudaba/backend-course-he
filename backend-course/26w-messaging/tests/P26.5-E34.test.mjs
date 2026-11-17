import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { MemoryQueue } = await load(import.meta.url, "P26.5-E34.ts");

test("receive, ack, nack", () => {
  const q = new MemoryQueue();
  for (const m of ["m1", "m2", "m3"]) q.push(m);
  const a = q.receive("A");
  assert.deepEqual(a, { tag: 1, msg: "m1" });
  const b = q.receive("B");
  assert.deepEqual(b, { tag: 2, msg: "m2" });
  assert.equal(q.size(), 1);
  assert.equal(q.unacked("A"), 1);
  q.ack(a.tag);
  assert.equal(q.unacked("A"), 0);
  q.nack(b.tag, true);
  assert.deepEqual(q.receive("A"), { tag: 3, msg: "m2" }, "requeue ← לראש התור");
  const c = q.receive("A");
  assert.equal(c.msg, "m3");
  q.nack(c.tag, false);
  assert.equal(q.size(), 0);
  assert.equal(q.receive("A"), null);
  assert.throws(() => q.ack(a.tag), "tag שכבר טופל");
  assert.throws(() => q.nack(99, true));
});
test("crash מחזיר את ה־unacked לראש, בסדר", () => {
  const q = new MemoryQueue();
  for (const m of [1, 2, 3, 4, 5]) q.push(m);
  q.receive("A"); q.receive("B"); q.receive("A");
  assert.equal(q.crash("A"), 2);
  assert.equal(q.unacked("A"), 0);
  assert.equal(q.unacked("B"), 1);
  assert.deepEqual([q.receive("C").msg, q.receive("C").msg, q.receive("C").msg, q.receive("C").msg], [1, 3, 4, 5]);
  assert.equal(q.crash("Z"), 0);
});
