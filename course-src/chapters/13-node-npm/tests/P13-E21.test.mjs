import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { load } from "../../tools/load.mjs";

const { settings } = await load(import.meta.url, "P13-E21.mjs");
const tmpdir = () => fs.mkdtempSync(path.join(os.tmpdir(), "p13-"));

test("המרות נכונות", () => assert.deepEqual(settings({ PORT: "8080", DEBUG: "false", MAX_UPLOAD_MB: "0" }), { port: 8080, nextPort: 8081, debug: false, maxUploadMb: 0 }));
test("ברירות מחדל", () => assert.deepEqual(settings({}), { port: 3000, nextPort: 3001, debug: false, maxUploadMb: 10 }));
test("DEBUG=true", () => assert.equal(settings({ DEBUG: "TRUE" }).debug, true));
