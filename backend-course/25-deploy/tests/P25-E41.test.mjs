import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = () => exportsOf(import.meta.url, "P25-E41.ts", ["parseTestOutput", "toMarkdown"]);
const OUT = `✔ adds (0.881192ms)
✖ parses date (1.054799ms)
✖ rejects a due date in the past (3.5ms)
﹣ skipped one (0.123466ms) # SKIP
ℹ tests 4
ℹ suites 0
ℹ pass 1
ℹ fail 2
ℹ cancelled 0
ℹ skipped 1
ℹ todo 0
ℹ duration_ms 82.6

✖ failing tests:

test at a.test.mjs:4:1
✖ parses date (1.054799ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

test at a.test.mjs:5:1
✖ rejects a due date in the past (3.5ms)
  Error: boom`;

test("parseTestOutput", async () => {
  const { parseTestOutput } = await get();
  assert.deepEqual(parseTestOutput(OUT), { tests: 4, pass: 1, fail: 2, skipped: 1, durationMs: 83, failed: ["parses date", "rejects a due date in the past"] });
  assert.deepEqual(parseTestOutput("ℹ tests 2\nℹ pass 2\nℹ duration_ms 10.2"), { tests: 2, pass: 2, fail: 0, skipped: 0, durationMs: 10, failed: [] });
  assert.deepEqual(parseTestOutput(""), { tests: 0, pass: 0, fail: 0, skipped: 0, durationMs: 0, failed: [] });
});
test("toMarkdown", async () => {
  const { parseTestOutput, toMarkdown } = await get();
  assert.equal(toMarkdown(parseTestOutput(OUT)), "## ❌ 1/4 בדיקות עברו\n- ✖ parses date\n- ✖ rejects a due date in the past");
  assert.equal(toMarkdown({ tests: 51, pass: 51, fail: 0, skipped: 0, durationMs: 900, failed: [] }), "## ✅ 51/51 בדיקות עברו");
});
