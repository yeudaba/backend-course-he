import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_git.mjs";

const FILE = "P09-E67.js";
const get = () => exportsOf(import.meta.url, FILE, ["parseBranches"]);

test("נוכחי ושאר הענפים", async () => {
  const { parseBranches } = await get();
  assert.deepEqual(parseBranches("  feature/summary\n* main\n  fix/typo\n"), { current: "main", others: ["feature/summary", "fix/typo"] });
  assert.deepEqual(parseBranches("* feature/x\n  main"), { current: "feature/x", others: ["main"] });
});
test("ענף יחיד, ובלי ענף מסומן", async () => {
  const { parseBranches } = await get();
  assert.deepEqual(parseBranches("* main\n"), { current: "main", others: [] });
  assert.deepEqual(parseBranches("  b\n  a"), { current: null, others: ["a", "b"] });
  assert.deepEqual(parseBranches(""), { current: null, others: [] });
});
