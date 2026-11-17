import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { parseDecisions } = await load(import.meta.url, "P29.5-E63.ts");
const me = { userId: 5, ownerId: 5 };

test("תקין ← לפי הסדר של pendingIds", () => {
  const r = parseDecisions(["t1", "t2", "t3"], { decisions: { t3: "deny", t1: "approve", t2: "approve" } }, me);
  assert.deepEqual(r, { t1: "approve", t2: "approve", t3: "deny" });
  assert.deepEqual(Object.keys(r), ["t1", "t2", "t3"]);
});
test("שגיאות", () => {
  assert.throws(() => parseDecisions(["t1"], { decisions: { t1: "approve" } }, { userId: 6, ownerId: 5 }), /forbidden/);
  for (const body of [null, "approve", {}, { decisions: [] }, { decisions: { t1: "yes" } }, { decisions: { t1: true } }]) {
    assert.throws(() => parseDecisions(["t1"], body, me), /invalid/, JSON.stringify(body));
  }
  assert.throws(() => parseDecisions(["t1"], { decisions: { t1: "approve", x9: "approve", y: "deny" } }, me), /unknown: x9, y/);
  assert.throws(() => parseDecisions(["t1", "t2", "t3"], { decisions: { t2: "deny" } }, me), /missing: t1, t3/);
  assert.throws(() => parseDecisions(["t1"], { decisions: { t1: "approve", toString: "approve" } }, me), /unknown: toString/);
  assert.throws(() => parseDecisions(["t1"], { decisions: {} }, me), /missing: t1/);
});
