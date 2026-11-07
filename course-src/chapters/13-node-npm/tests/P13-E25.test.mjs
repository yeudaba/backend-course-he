import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { load } from "../../tools/load.mjs";

const { rotate } = await load(import.meta.url, "P13-E25.mjs");
const tmpdir = () => fs.mkdtempSync(path.join(os.tmpdir(), "p13-"));

test("סיבוב עם חורים", async () => {
  const d = tmpdir();
  for (const f of ["app.log", "app.log.1", "app.log.3"]) fs.writeFileSync(path.join(d, f), f);
  assert.deepEqual(await rotate(d, "app.log", 3), ["delete app.log.3", "app.log.1 -> app.log.2", "app.log -> app.log.1", "create app.log"]);
  assert.deepEqual(fs.readdirSync(d).sort(), ["app.log", "app.log.1", "app.log.2"]);
  assert.equal(fs.readFileSync(path.join(d, "app.log.1"), "utf8"), "app.log");
  assert.equal(fs.readFileSync(path.join(d, "app.log.2"), "utf8"), "app.log.1");
  assert.equal(fs.readFileSync(path.join(d, "app.log"), "utf8"), "");
});
test("תיקייה ריקה", async () => { const d = tmpdir(); assert.deepEqual(await rotate(d, "x.log", 2), ["create x.log"]); });
