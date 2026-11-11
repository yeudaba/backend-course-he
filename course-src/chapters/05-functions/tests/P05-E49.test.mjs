import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P05-E49.js";
const get = () => exportsOf(import.meta.url, FILE, ["formatDuration"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("עם שניות (ברירת מחדל)", async () => {
  const { formatDuration } = await get();
  assert.equal(formatDuration(3725), "1:02:05");
  assert.equal(formatDuration(59), "0:00:59");
  assert.equal(formatDuration(36000), "10:00:00");
});
test("בלי שניות", async () => {
  const { formatDuration } = await get();
  assert.equal(formatDuration(3725, false), "1:02");
  assert.equal(formatDuration(59, false), "0:00");
});
test("true במפורש", async () => {
  const { formatDuration } = await get();
  assert.equal(formatDuration(61, true), "0:01:01");
});
