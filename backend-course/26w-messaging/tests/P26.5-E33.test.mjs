import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { crashOutcomes } = await load(import.meta.url, "P26.5-E33.ts");

test("שני הסדרים", () => {
  assert.deepEqual(crashOutcomes(["ack", "handle"]), { minHandled: 0, maxHandled: 1, guarantee: "at-most-once" });
  assert.deepEqual(crashOutcomes(["handle", "ack"]), { minHandled: 1, maxHandled: 2, guarantee: "at-least-once" });
});
test("קלט לא תקין", () => {
  for (const bad of [["ack"], ["ack", "ack"], ["handle", "ack", "ack"], []]) assert.throws(() => crashOutcomes(bad), RangeError);
});
