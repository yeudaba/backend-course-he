import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { filesDir, runScript, tempDir } from "../../tools/shell.mjs";

const logs = path.join(filesDir(import.meta.url), "logs");

test("תיקיות ושמות עם רווחים", (t) => {
  const dir = tempDir(t);
  const src = path.join(dir, "my data");
  fs.mkdirSync(src);
  for (const f of ["a b.json", "c.json", "notes.txt"]) fs.writeFileSync(path.join(src, f), "{}");
  const r = runScript(import.meta.url, "P23-E22.sh", [src, path.join(dir, "out dir")]);
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(r.lines, ["הועתקו 2 קבצים"]);
  assert.deepEqual(fs.readdirSync(path.join(dir, "out dir")).sort(), ["a b.json", "c.json"]);
});
test("בלי ארגומנטים ← הודעת שימוש, exit 2", () => {
  const r = runScript(import.meta.url, "P23-E22.sh", []);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /שימוש/);
});
test("כשההעתקה נכשלת — לא מדווחים הצלחה", (t) => {
  const dir = tempDir(t);
  const src = path.join(dir, "src");
  fs.mkdirSync(src);
  fs.writeFileSync(path.join(src, "a.json"), "{}");
  fs.writeFileSync(path.join(dir, "not-a-dir"), "file");
  const r = runScript(import.meta.url, "P23-E22.sh", [src, path.join(dir, "not-a-dir")]);
  assert.notEqual(r.status, 0, "היעד הוא קובץ, לא תיקייה — הסקריפט חייב להיכשל");
  assert.doesNotMatch(r.stdout, /הועתקו/);
});
