import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { partitionPath, parsePartition } = await load(import.meta.url, "P28.5-E91.ts");

test("partitionPath", () => {
  assert.equal(partitionPath("orders", "2026-10-05T23:30:00Z", 7), "lake/orders/day=2026-10-05/part-00007.parquet");
  assert.equal(partitionPath("page_views", "2026-10-06T01:30:00+03:00", 12345), "lake/page_views/day=2026-10-05/part-12345.parquet");
  assert.equal(partitionPath("orders", new Date(Date.UTC(2026, 0, 1)), 0), "lake/orders/day=2026-01-01/part-00000.parquet");
  for (const [t, at, p] of [["Orders", "2026-10-05", 1], ["orders", "nope", 1], ["orders", "2026-10-05", -1], ["orders", "2026-10-05", 100000], ["orders", "2026-10-05", 1.5], ["../x", "2026-10-05", 1]]) {
    assert.throws(() => partitionPath(t, at, p), Error, `${t} ${at} ${p}`);
  }
});
test("parsePartition", () => {
  assert.deepEqual(parsePartition("lake/orders/day=2026-10-05/part-00007.parquet"), { table: "orders", day: "2026-10-05", part: 7 });
  for (const bad of ["lake/orders/day=2026-10-05/part-7.parquet", "orders/day=2026-10-05/part-00007.parquet", "lake/orders/2026-10-05/part-00007.parquet", "lake/orders/day=2026-10-05/part-00007.csv"]) {
    assert.throws(() => parsePartition(bad), Error, bad);
  }
  const p = partitionPath("events", "2026-12-31T22:00:00Z", 42);
  assert.deepEqual(parsePartition(p), { table: "events", day: "2026-12-31", part: 42 });
});
