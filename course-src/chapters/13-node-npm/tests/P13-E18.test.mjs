import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { load } from "../../tools/load.mjs";

const { countStatuses } = await load(import.meta.url, "P13-E18.mjs");
const tmpdir = () => fs.mkdtempSync(path.join(os.tmpdir(), "p13-"));

test("ספירה", async () => {
  const f = path.join(tmpdir(), "a.log");
  fs.writeFileSync(f, "GET /a 200 12\nGET /b 404 3\n\nPOST /c 500 900\nbroken line\nGET /d 301 5\nGET /e 999 1\nGET /f abc 1\n");
  assert.deepEqual(await countStatuses(f), { "2xx": 1, "3xx": 1, "4xx": 1, "5xx": 1, invalid: 3, slowest: { path: "/c", ms: 900 } });
});
test("משתמש ב־readline/stream", async () => {
  const src = fs.readFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), "..", process.env.CHECK_TARGET || "starter", "P13-E18.mjs"), "utf8");
  assert.ok(!/readFile(Sync)?\(/.test(src), "אסור readFile");
});
