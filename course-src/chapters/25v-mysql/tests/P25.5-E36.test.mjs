import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { target } from "../../tools/load.mjs";
import { sameAsSolution } from "./_sqlcheck.mjs";

test("התוצאה", async (t) => {
  const { got, expected } = await sameAsSolution(t, import.meta.url, "P25.5-E36.sql", { seed: "basics.sql" });
  assert.deepEqual(got, expected);
});
test("באמת דרך time_zone של החיבור", async (t) => {
  const text = fs.readFileSync(target(import.meta.url, "P25.5-E36.sql"), "utf8").replace(/--.*$/gm, "");
  assert.match(text, /SET\s+(SESSION\s+|@@session\.)?time_zone\s*=\s*'\+02:00'/i, "SET time_zone = '+02:00'");
  assert.equal((text.match(/INSERT\s+INTO\s+events/gi) ?? []).length, 2, "שני INSERT");
  assert.doesNotMatch(text, /CONVERT_TZ/i, "בלי CONVERT_TZ — ההמרה של TIMESTAMP היא העניין");
});
