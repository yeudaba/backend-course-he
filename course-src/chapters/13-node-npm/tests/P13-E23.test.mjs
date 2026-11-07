import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { load } from "../../tools/load.mjs";

const { countMatchingLines } = await load(import.meta.url, "P13-E23.mjs");
const tmpdir = () => fs.mkdtempSync(path.join(os.tmpdir(), "p13-"));

test("ספירה", async () => { const f = path.join(tmpdir(), "x.txt"); fs.writeFileSync(f, "Error A\nok\nERROR b\n"); assert.equal(await countMatchingLines(f, "error"), 2); });
test("בלי שורה ריקה בסוף", async () => { const f = path.join(tmpdir(), "y.txt"); fs.writeFileSync(f, "a\n\nb\n"); assert.equal(await countMatchingLines(f, "zzz"), 0); });
