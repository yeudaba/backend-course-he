import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { assertEqual, runChecks } = await load(import.meta.url, "P08-E19.js");

test("assertEqual עובר בשקט", () => assert.doesNotThrow(() => assertEqual(1, 1, "x")));
test("assertEqual זורק עם הודעה", () => assert.throws(() => assertEqual(3, 4, "add"), { message: "add: ציפינו ל־4 וקיבלנו 3" }));
test("runChecks", () => {
  const r = runChecks([
    { name: "a", fn: () => {} },
    { name: "b", fn: () => { throw new Error("נכשל"); } },
    { name: "c", fn: () => {} },
  ]);
  assert.deepEqual(r, { passed: ["a", "c"], failed: [{ name: "b", error: "נכשל" }] });
});
