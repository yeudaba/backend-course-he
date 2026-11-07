import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { load } from "../../tools/load.mjs";

const { dirStats } = await load(import.meta.url, "P13-E12.mjs");
const tmpdir = () => fs.mkdtempSync(path.join(os.tmpdir(), "p13-"));

test("סטטיסטיקה", async () => {
  const d = tmpdir();
  fs.writeFileSync(path.join(d, "a.TXT"), "12345"); fs.writeFileSync(path.join(d, "b.txt"), "1"); fs.writeFileSync(path.join(d, "Makefile"), "xy"); fs.mkdirSync(path.join(d, "sub")); fs.writeFileSync(path.join(d, "sub", "c.txt"), "zzz");
  assert.deepEqual(await dirStats(d), { files: 3, totalBytes: 8, byExtension: { txt: 2, "(none)": 1 } });
});
