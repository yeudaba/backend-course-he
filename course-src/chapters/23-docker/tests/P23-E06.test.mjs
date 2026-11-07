import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { filesDir, runScript, tempDir } from "../../tools/shell.mjs";

const logs = path.join(filesDir(import.meta.url), "logs");

test("רק שורות שהרמה שלהן ERROR", () => {
  const r = runScript(import.meta.url, "P23-E06.sh", [path.join(logs, "app.log")]);
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(r.lines, ["3"], "3 שורות ERROR (השורה האחרונה רק מזכירה את המילה)");
});
test("לוג בלי שגיאות ← 0", (t) => {
  const dir = tempDir(t);
  fs.writeFileSync(path.join(dir, "ok.log"), "2026-11-07T08:00:01Z INFO  fine\n");
  assert.deepEqual(runScript(import.meta.url, "P23-E06.sh", [path.join(dir, "ok.log")]).lines, ["0"]);
});
test("שגיאות שימוש", () => {
  const missing = runScript(import.meta.url, "P23-E06.sh", ["/no/such/file.log"]);
  assert.equal(missing.status, 1, "קובץ לא קיים ← exit 1");
  assert.match(missing.stderr, /לא נמצא/);
  assert.equal(runScript(import.meta.url, "P23-E06.sh", []).status, 2, "בלי ארגומנט ← exit 2");
});
