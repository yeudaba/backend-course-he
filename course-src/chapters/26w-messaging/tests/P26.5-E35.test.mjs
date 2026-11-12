import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { MemoryLog } = await load(import.meta.url, "P26.5-E35.ts");
const h = (k) => [...k].reduce((s, c) => s + c.charCodeAt(0), 0);

test("append — partition לפי ה־hash, ו־offset רץ בכל partition", () => {
  const log = new MemoryLog(3);
  assert.deepEqual(log.append("order-1", "placed"), { partition: h("order-1") % 3, offset: 0 });
  assert.deepEqual(log.append("order-1", "paid"), { partition: h("order-1") % 3, offset: 1 });
  const p2 = log.append("order-2", "placed");
  assert.equal(p2.partition, h("order-2") % 3);
  assert.equal(p2.offset, p2.partition === h("order-1") % 3 ? 2 : 0);
});
test("read לא מזיז; commit; groups עצמאיים; lag", () => {
  const log = new MemoryLog(1);
  for (const v of ["a", "b", "c", "d"]) log.append("k", v);
  assert.deepEqual(log.read("emails", 0, 2), [{ offset: 0, key: "k", value: "a" }, { offset: 1, key: "k", value: "b" }]);
  assert.deepEqual(log.read("emails", 0, 2).map((m) => m.offset), [0, 1], "read לא מזיז");
  log.commit("emails", 0, 2);
  assert.deepEqual(log.read("emails", 0, 10).map((m) => m.value), ["c", "d"]);
  assert.equal(log.read("analytics", 0, 10).length, 4, "group אחר — מההתחלה");
  assert.equal(log.lag("emails"), 2);
  assert.equal(log.lag("analytics"), 4);
  log.commit("emails", 0, 1);
  assert.deepEqual(log.read("emails", 0, 1).map((m) => m.value), ["b"], "replay");
});
test("lag על כמה partitions", () => {
  const log = new MemoryLog(2);
  for (let i = 0; i < 10; i++) log.append(`key-${i}`, String(i));
  assert.equal(log.lag("g"), 10);
  const p0 = log.read("g", 0, 100).length;
  log.commit("g", 0, p0);
  assert.equal(log.lag("g"), 10 - p0);
});
