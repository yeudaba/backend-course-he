import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { deathCount } = await load(import.meta.url, "P26.5-E55.ts");
const headers = {
  "x-death": [
    { queue: "work.retry", reason: "expired", count: 2, exchange: "" },
    { queue: "work", reason: "rejected", count: 2, exchange: "" },
    { queue: "work", reason: "expired", count: 1 },
    { queue: "other", reason: "rejected" },
  ],
};

test("לפי תור, ולפי סיבה", () => {
  assert.equal(deathCount(headers, "work", "rejected"), 2);
  assert.equal(deathCount(headers, "work"), 3);
  assert.equal(deathCount(headers, "work.retry", "expired"), 2);
  assert.equal(deathCount(headers, "other"), 1, "count חסר ← 1");
  assert.equal(deathCount(headers, "nope"), 0);
});
test("בלי x-death", () => {
  assert.equal(deathCount(undefined, "work"), 0);
  assert.equal(deathCount({}, "work"), 0);
  assert.equal(deathCount({ "x-death": "x" }, "work"), 0);
});
