import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_git.mjs";

const FILE = "P09-E43.js";
const get = () => exportsOf(import.meta.url, FILE, ["shortlog"]);

test("ספירה ומיון", async () => {
  const { shortlog } = await get();
  assert.deepEqual(shortlog("Dana|Add login\nOmer|Fix total\nDana|Add logout\nNoa|Update README\nDana|Add tests\n"), ["   3  Dana", "   1  Noa", "   1  Omer"]);
});
test("הודעה עם | ושורות ריקות", async () => {
  const { shortlog } = await get();
  assert.deepEqual(shortlog("Omer|Use a|b syntax\n\nOmer|x\nAvi|y|z"), ["   2  Omer", "   1  Avi"]);
});
test("ריפוד לרוחב 4", async () => {
  const { shortlog } = await get();
  const text = Array.from({ length: 12 }, () => "Dana|x").join("\n");
  assert.deepEqual(shortlog(text), ["  12  Dana"]);
  assert.deepEqual(shortlog(""), []);
});
