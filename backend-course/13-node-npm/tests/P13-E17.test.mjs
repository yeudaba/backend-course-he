import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { load } from "../../tools/load.mjs";

const { storeUpload } = await load(import.meta.url, "P13-E17.mjs");
const tmpdir = () => fs.mkdtempSync(path.join(os.tmpdir(), "p13-"));

test("שומר בשם חדש בתוך התיקייה", async () => {
  const base = path.join(tmpdir(), "uploads");
  const r = await storeUpload(base, "../../evil/Report.PDF", "hello");
  assert.match(r.storedName, /^[0-9a-f-]{36}\.pdf$/);
  assert.equal(r.originalName, "Report.PDF"); assert.equal(r.size, 5);
  assert.equal(fs.readFileSync(path.join(base, r.storedName), "utf8"), "hello");
  assert.deepEqual(fs.readdirSync(base), [r.storedName]);
});
test("שמות שונים לאותו קובץ", async () => { const base = tmpdir(); const a = await storeUpload(base, "a.png", "x"); const b = await storeUpload(base, "a.png", "x"); assert.notEqual(a.storedName, b.storedName); });
test("סוג לא נתמך", async () => { for (const n of ["x.exe", "x.js", "noext", "x.png.sh"]) await assert.rejects(storeUpload(tmpdir(), n, "x"), { message: "סוג קובץ לא נתמך" }); });
