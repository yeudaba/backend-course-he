import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { toEnum } = await load(import.meta.url, "P29-E53.ts");
const A = ["order_status", "refund", "complaint", "other"];

test("נרמול ו־synonyms", () => {
  assert.equal(toEnum("  COMPLAINT ", A), "complaint");
  assert.equal(toEnum("order-status", A), "order_status");
  assert.equal(toEnum("Order  Status", A), "order_status");
  assert.equal(toEnum("Refund request", A, { refund_request: "refund" }), "refund");
  assert.equal(toEnum("Refund request", A), null);
  assert.equal(toEnum("spam", A), null);
});
test("לא מחרוזת, ו־prototype", () => {
  assert.equal(toEnum(5, A), null);
  assert.equal(toEnum(null, A), null);
  assert.equal(toEnum("constructor", A, {}), null);
  assert.equal(toEnum("toString", A), null);
});
