import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { readFirstExisting } = await load(import.meta.url, "P10-E13.js");
const sleep = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));
const failAfter = (ms, m) => new Promise((_, rej) => setTimeout(() => rej(new Error(m)), ms));

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "p10e13-"));
fs.writeFileSync(path.join(dir, "b.txt"), "B");
fs.writeFileSync(path.join(dir, "c.txt"), "C");
test("הראשון שקיים", async () => {
  const r = await readFirstExisting([path.join(dir, "a.txt"), path.join(dir, "b.txt"), path.join(dir, "c.txt")]);
  assert.deepEqual(r, { file: path.join(dir, "b.txt"), text: "B" });
});
test("אף אחד", async () => assert.rejects(readFirstExisting([path.join(dir, "x"), path.join(dir, "y")]), { message: "לא נמצא אף קובץ" }));
