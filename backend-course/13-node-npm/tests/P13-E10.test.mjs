import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { load } from "../../tools/load.mjs";

const { parseDotenv } = await load(import.meta.url, "P13-E10.mjs");
const tmpdir = () => fs.mkdtempSync(path.join(os.tmpdir(), "p13-"));

test("בסיסי", () => assert.deepEqual(parseDotenv('# db\nDATABASE_URL = postgres://a:b@h/db?x=1\nAPP_NAME="Dana Shop"\n\nEMPTY=\nQ=\'single\''), { DATABASE_URL: "postgres://a:b@h/db?x=1", APP_NAME: "Dana Shop", EMPTY: "", Q: "single" }));
test("שורה לא תקינה", () => assert.throws(() => parseDotenv("A=1\n\nBROKEN"), { message: "שורה 3 לא תקינה" }));
test("מירכאה בודדת לא מוסרת", () => assert.deepEqual(parseDotenv('A="x'), { A: '"x' }));
