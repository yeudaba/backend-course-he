import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { load } from "../../tools/load.mjs";

const { parseArgs } = await load(import.meta.url, "P13-E08.mjs");
const tmpdir = () => fs.mkdtempSync(path.join(os.tmpdir(), "p13-"));

test("דוגמה", () => assert.deepEqual(parseArgs(["add", "--amount", "5", "--note=hi there", "--dry", "--x"]), { positional: ["add"], flags: { amount: "5", note: "hi there", dry: true, x: true } }));
test("positional בכל מקום", () => assert.deepEqual(parseArgs(["a", "--k", "v", "b"]), { positional: ["a", "b"], flags: { k: "v" } }));
test("ריק", () => assert.deepEqual(parseArgs([]), { positional: [], flags: {} }));
test("= עם ערך ריק", () => assert.deepEqual(parseArgs(["--a="]), { positional: [], flags: { a: "" } }));
