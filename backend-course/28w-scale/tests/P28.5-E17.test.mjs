import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { estimateScan } = await load(import.meta.url, "P28.5-E17.ts");
const events = {
  rows: 1_000_000_000,
  columns: { event_id: 16, user_id: 8, ts: 8, url: 80, payload: 400 },
  partitionedBy: "ts",
  days: 365,
};

test("SELECT * על כל הטבלה", () => {
  assert.deepEqual(estimateScan(events, { columns: "*" }), { bytes: 512_000_000_000, costUsd: 2.91 });
});
test("LIMIT לא מקטין את הסריקה", () => {
  assert.deepEqual(estimateScan(events, { columns: "*", limit: 10 }), estimateScan(events, { columns: "*" }));
});
test("רק העמודות שצריך — עמודתי", () => {
  assert.deepEqual(estimateScan(events, { columns: ["user_id", "url"] }), { bytes: 88_000_000_000, costUsd: 0.5 });
});
test("partition pruning: 7 ימים מתוך 365", () => {
  assert.deepEqual(estimateScan(events, { columns: ["user_id", "url"], days: 7 }), { bytes: 1_687_671_233, costUsd: 0.01 });
  assert.deepEqual(estimateScan({ ...events, partitionedBy: undefined }, { columns: ["user_id"], days: 7 }).bytes, 8_000_000_000, "בלי partitions — הכול נסרק");
});
test("מחיר אחר, ועמודה שלא קיימת", () => {
  assert.equal(estimateScan(events, { columns: "*" }, { pricePerTiB: 5 }).costUsd, 2.33);
  assert.throws(() => estimateScan(events, { columns: ["nope"] }), /nope/);
});
