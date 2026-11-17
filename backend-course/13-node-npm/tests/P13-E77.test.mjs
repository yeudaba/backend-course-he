import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P13-E77.mjs", ["freeName"])).freeName;
const dirWith = (names) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "p13-e77-t-"));
  for (const n of names) fs.writeFileSync(path.join(dir, n), "");
  return dir;
};

test("שם פנוי — כמו שהוא", async () => {
  const freeName = await get();
  const dir = dirWith(["other.pdf"]);
  assert.equal(await freeName(dir, "report.pdf"), "report.pdf");
});
test("מספור עד השם הפנוי הראשון", async () => {
  const freeName = await get();
  const dir = dirWith(["report.pdf", "report (1).pdf", "report (3).pdf", "README", "archive.tar.gz", "my.report.pdf"]);
  assert.equal(await freeName(dir, "report.pdf"), "report (2).pdf");
  assert.equal(await freeName(dir, "README"), "README (1)");
  assert.equal(await freeName(dir, "archive.tar.gz"), "archive.tar (1).gz");
  assert.equal(await freeName(dir, "my.report.pdf"), "my.report (1).pdf");
});
test("path traversal — רק basename", async () => {
  const freeName = await get();
  const dir = dirWith(["notes.txt"]);
  assert.equal(await freeName(dir, "../../etc/passwd"), "passwd");
  assert.equal(await freeName(dir, "/tmp/x/notes.txt"), "notes (1).txt");
});
test("שגיאה שאינה ENOENT נזרקת", async () => {
  const freeName = await get();
  const dir = dirWith(["file"]);
  await assert.rejects(freeName(path.join(dir, "file"), "a.txt"), (e) => e.code === "ENOTDIR", "כשהתיקייה היא בעצם קובץ — השגיאה (ENOTDIR) צריכה לעבור הלאה");
});
