import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { lineCounts, countLines } = await load(import.meta.url, "P10-E14.js");
const sleep = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));
const failAfter = (ms, m) => new Promise((_, rej) => setTimeout(() => rej(new Error(m)), ms));

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
test("countLines", () => { assert.equal(countLines("a\nb\n"), 2); assert.equal(countLines("a"), 1); assert.equal(countLines(""), 0); assert.equal(countLines("a\n\nb"), 3); });
test("lineCounts", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "p10e14-"));
  fs.writeFileSync(path.join(dir, "a.txt"), "1\n2\n3\n");
  fs.writeFileSync(path.join(dir, "b.txt"), "");
  fs.writeFileSync(path.join(dir, "c.md"), "ignored");
  assert.deepEqual(await lineCounts(dir), { "a.txt": 3, "b.txt": 0 });
});
