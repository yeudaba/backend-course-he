import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = () => exportsOf(import.meta.url, "P24-E38.ts", ["parseLevel", "isEnabled"]);
const LEVELS = ["debug", "info", "warn", "error"];

test("parseLevel", async () => {
  const { parseLevel } = await get();
  for (const l of LEVELS) assert.equal(parseLevel(l), l);
  assert.equal(parseLevel(" WARN "), "warn", "trim ובלי תלות באותיות");
  assert.equal(parseLevel("Debug"), "debug");
  for (const bad of [undefined, "", "   ", "verbose", "trace", "toString", "constructor", "inf"]) {
    assert.equal(parseLevel(bad), "info", `${JSON.stringify(bad)} ← ברירת המחדל info`);
  }
});
test("isEnabled — לפי הסדר debug < info < warn < error", async () => {
  const { isEnabled } = await get();
  for (const [i, level] of LEVELS.entries()) {
    for (const [j, min] of LEVELS.entries()) {
      assert.equal(isEnabled(level, min), i >= j, `isEnabled("${level}", "${min}")`);
    }
  }
});
