import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { load } from "../../tools/load.mjs";

const { fileHash, findDuplicates } = await load(import.meta.url, "P13-E19.mjs");
const tmpdir = () => fs.mkdtempSync(path.join(os.tmpdir(), "p13-"));

test("fileHash", async () => { const f = path.join(tmpdir(), "h"); fs.writeFileSync(f, "hello"); assert.equal(await fileHash(f), "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"); });
test("findDuplicates", async () => {
  const d = tmpdir();
  for (const [n, t] of [["c.txt", "x"], ["b.txt", "y"], ["a.txt", "x"], ["d.txt", "y"], ["e.txt", "z"]]) fs.writeFileSync(path.join(d, n), t);
  assert.deepEqual(await findDuplicates(d), [["a.txt", "c.txt"], ["b.txt", "d.txt"]]);
});
