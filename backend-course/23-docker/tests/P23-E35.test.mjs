import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { runScript, filesDir, tempDir } from "../../tools/shell.mjs";

const FILE = "P23-E35.sh";
const line = (status) => `10.0.0.1 - - [07/Nov/2026:08:00:01 +0000] "GET /x HTTP/1.1" ${status} 12`;

test("הלוג של הפרק", () => {
  const r = runScript(import.meta.url, FILE, [path.join(filesDir(import.meta.url), "logs", "access.log")]);
  assert.equal(r.status, 0, r.stderr);
  const src = fs.readFileSync(path.join(filesDir(import.meta.url), "logs", "access.log"), "utf8").trim().split("\n");
  const want = {};
  for (const l of src) { const k = l.split(" ")[8][0] + "xx"; want[k] = (want[k] ?? 0) + 1; }
  assert.deepEqual(r.lines, Object.keys(want).sort().map((k) => `${k} ${want[k]}`));
});
test("כל הקבוצות, לפי הסדר", (t) => {
  const dir = tempDir(t);
  const f = path.join(dir, "my access.log");
  fs.writeFileSync(f, [503, 200, 404, 301, 201, 500, 204, 302, 404, 200].map(line).join("\n") + "\n");
  const r = runScript(import.meta.url, FILE, [f]);
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(r.lines, ["2xx 4", "3xx 2", "4xx 2", "5xx 2"], "נתיב עם רווח — מרכאות");
});
test("ריק, וארגומנטים", (t) => {
  const dir = tempDir(t);
  const f = path.join(dir, "empty.log");
  fs.writeFileSync(f, "");
  const r = runScript(import.meta.url, FILE, [f]);
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(r.lines, []);
  const u = runScript(import.meta.url, FILE, []);
  assert.equal(u.status, 2);
  assert.notEqual(u.stderr.trim(), "", "הודעת שימוש ל־stderr");
  assert.equal(runScript(import.meta.url, FILE, [path.join(dir, "nope.log")]).status, 1);
});
