import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P05-E35.js";
const get = () => exportsOf(import.meta.url, FILE, ["minutesToText"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("135 ← 2:15", async () => {
  const { minutesToText } = await get();
  assert.equal(minutesToText(135), "2:15");
});
test("59, 60, 0", async () => {
  const { minutesToText } = await get();
  assert.equal(minutesToText(59), "0:59");
  assert.equal(minutesToText(60), "1:00");
  assert.equal(minutesToText(0), "0:00");
});
test("יותר מיממה", async () => {
  const { minutesToText } = await get();
  assert.equal(minutesToText(1505), "25:05");
});
