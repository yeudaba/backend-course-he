import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { runScript, tempDir } from "../../tools/shell.mjs";

const FILE = "P23-E26.sh";
const DAYS = ["2026-11-03", "2026-10-30", "2026-11-05", "2026-11-01", "2026-11-04"];

function setup(t) {
  const dir = tempDir(t);
  const backups = path.join(dir, "my backups");
  fs.mkdirSync(path.join(backups, "archive"), { recursive: true });
  for (const d of DAYS) fs.writeFileSync(path.join(backups, `db-${d}.sql.gz`), d);
  for (const other of ["notes.txt", "db-latest.sql.gz", "db-2026-11-02.sql", "archive/db-2026-01-01.sql.gz"]) fs.writeFileSync(path.join(backups, other), "x");
  return backups;
}
const left = (dir) => fs.readdirSync(dir).sort();

test("משאיר את 3 האחרונים, ומדפיס את מה שנמחק מהישן לחדש", (t) => {
  const dir = setup(t);
  const r = runScript(import.meta.url, FILE, [dir, "3"]);
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(r.lines, ["db-2026-10-30.sql.gz", "db-2026-11-01.sql.gz"], "מדפיסים רק את השם, מהישן לחדש");
  assert.deepEqual(
    left(dir),
    ["archive", "db-2026-11-02.sql", "db-2026-11-03.sql.gz", "db-2026-11-04.sql.gz", "db-2026-11-05.sql.gz", "db-latest.sql.gz", "notes.txt"],
    "נמחקו קבצים לא נכונים. רק db-YYYY-MM-DD.sql.gz נחשב גיבוי (התיקייה עם רווח בשם — שים מירכאות)",
  );
  assert.ok(fs.existsSync(path.join(dir, "archive", "db-2026-01-01.sql.gz")), "לא נוגעים בתתי־תיקיות (-maxdepth 1)");
});
test("keep גדול ממספר הגיבויים — לא נוגעים בכלום", (t) => {
  const dir = setup(t);
  const before = left(dir);
  const r = runScript(import.meta.url, FILE, [dir, "5"]);
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(r.lines, []);
  assert.deepEqual(left(dir), before);
  assert.equal(runScript(import.meta.url, FILE, [dir, "9"]).status, 0);
});
test("keep=1, ותיקייה בלי גיבויים", (t) => {
  const dir = setup(t);
  const r = runScript(import.meta.url, FILE, [dir, "1"]);
  assert.equal(r.lines.length, 4);
  assert.ok(fs.existsSync(path.join(dir, "db-2026-11-05.sql.gz")), "נשאר האחרון — 2026-11-05");
  const empty = path.join(tempDir(t), "empty");
  fs.mkdirSync(empty);
  const r2 = runScript(import.meta.url, FILE, [empty, "2"]);
  assert.equal(r2.status, 0, `תיקייה בלי גיבויים היא לא שגיאה: ${r2.stderr}`);
  assert.deepEqual(r2.lines, []);
});
test("ארגומנטים שגויים ← exit 2, ובלי למחוק", (t) => {
  const dir = setup(t);
  const before = left(dir);
  assert.equal(runScript(import.meta.url, FILE, []).status, 2, "בלי ארגומנטים");
  assert.equal(runScript(import.meta.url, FILE, [dir]).status, 2, "בלי keep");
  for (const keep of ["0", "-1", "abc", "2.5"]) assert.equal(runScript(import.meta.url, FILE, [dir, keep]).status, 2, `keep=${keep}`);
  assert.deepEqual(left(dir), before, "אחרי ארגומנטים שגויים אסור שיימחק משהו");
  assert.equal(runScript(import.meta.url, FILE, [path.join(dir, "nope"), "2"]).status, 1, "תיקייה שלא קיימת ← exit 1");
});
