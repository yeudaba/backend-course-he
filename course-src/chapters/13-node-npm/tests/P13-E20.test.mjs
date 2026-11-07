import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { load } from "../../tools/load.mjs";

const { loadPrices } = await load(import.meta.url, "P13-E20.mjs");
const tmpdir = () => fs.mkdtempSync(path.join(os.tmpdir(), "p13-"));

test("עובד מכל תיקייה", async () => { const prev = process.cwd(); process.chdir(os.tmpdir()); try { assert.deepEqual(await loadPrices(), { "KB-101": 199, "MS-201": 89 }); } finally { process.chdir(prev); } });
