import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { filesDir, runScript, tempDir } from "../../tools/shell.mjs";

const logs = path.join(filesDir(import.meta.url), "logs");

test("שלוש הראשונות", () => {
  const r = runScript(import.meta.url, "P23-E07.sh", [path.join(logs, "access.log")]);
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(r.lines, ["4 10.0.0.5", "3 10.0.0.7", "2 10.0.0.9"]);
});
test("N אחר, ותיקו לפי הכתובת", () => {
  const r = runScript(import.meta.url, "P23-E07.sh", [path.join(logs, "access.log"), "5"]);
  assert.deepEqual(r.lines, ["4 10.0.0.5", "3 10.0.0.7", "2 10.0.0.9", "1 10.0.0.11", "1 192.168.1.20"]);
});
test("בלי ארגומנטים ← exit 2", () => {
  assert.equal(runScript(import.meta.url, "P23-E07.sh", []).status, 2);
});
