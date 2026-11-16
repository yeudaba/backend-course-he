import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { latestVersions } = await load(import.meta.url, "P28.5-E90.ts");

const recs = [
  { id: 5, updatedAt: "2026-10-01T10:00:00Z", status: "paid" },
  { id: 2, updatedAt: "2026-10-02T10:00:00Z", status: "paid" },
  { id: 5, updatedAt: "2026-10-12T10:00:00Z", status: "cancelled" },
  { id: 2, updatedAt: "2026-10-02T12:00:00+02:00", status: "refunded" },
  { id: 8, updatedAt: "2026-10-20T00:00:00Z", status: "paid" },
];

test("האחרונה, ובתיקו — האחרונה בקלט", () => {
  assert.deepEqual(latestVersions(recs).map((r) => [r.id, r.status]), [[2, "refunded"], [5, "cancelled"], [8, "paid"]]);
});
test("asOf", () => {
  assert.deepEqual(latestVersions(recs, "2026-10-10T00:00:00Z").map((r) => [r.id, r.status]), [[2, "refunded"], [5, "paid"]]);
  assert.deepEqual(latestVersions(recs, "2026-09-01T00:00:00Z"), []);
  assert.deepEqual(latestVersions([]), []);
});
