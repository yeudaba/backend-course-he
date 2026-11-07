import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { filesDir, runScript, tempDir } from "../../tools/shell.mjs";

const logs = path.join(filesDir(import.meta.url), "logs");

test("רק .log מעל N KB, בכל העומק, ממוין", (t) => {
  const dir = tempDir(t);
  const make = (rel, kb) => {
    fs.mkdirSync(path.join(dir, path.dirname(rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, rel), "x".repeat(kb * 1024));
  };
  make("data/small.log", 5);
  make("data/api/big.log", 20);
  make("data/db/huge.log", 50);
  make("data/notes.txt", 50);
  make("data/b.log", 12);
  const r = runScript(import.meta.url, "P23-E10.sh", ["data", "10"], { cwd: dir });
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(r.lines, ["data/api/big.log", "data/b.log", "data/db/huge.log"]);
  assert.deepEqual(runScript(import.meta.url, "P23-E10.sh", ["data", "30"], { cwd: dir }).lines, ["data/db/huge.log"]);
});
test("בלי ארגומנטים ← exit 2", () => {
  assert.equal(runScript(import.meta.url, "P23-E10.sh", []).status, 2);
});
