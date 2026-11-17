import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { deliver } = await load(import.meta.url, "P26.5-E40.ts");
const groups = { emails: ["e1", "e2"], analytics: ["a1"] };
const msgs = ["m1", "m2", "m3", "m4"];

test("queue — מתחלקות בין כולם", () => {
  assert.deepEqual(deliver("queue", groups, msgs), { e1: ["m1", "m4"], e2: ["m2"], a1: ["m3"] });
});
test("log — כל group מקבל הכול", () => {
  assert.deepEqual(deliver("log", groups, msgs), { e1: ["m1", "m3"], e2: ["m2", "m4"], a1: msgs });
  assert.deepEqual(deliver("log", { g: ["x", "y", "z"] }, ["m1"]), { x: ["m1"], y: [], z: [] }, "consumer בלי הודעות — עם []");
  assert.deepEqual(deliver("queue", { g: [] }, ["m1"]), {});
});
