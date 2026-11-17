import { test } from "node:test";
import assert from "node:assert/strict";
import { runScript } from "../../tools/shell.mjs";
import { fakeDocker } from "./_fakedocker.mjs";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { spawnSync } from "node:child_process";
import { tempDir } from "../../tools/shell.mjs";

const today = () => spawnSync("date", ["+%F"], { encoding: "utf8" }).stdout.trim();
const DUMP = "-- PostgreSQL database dump\nCREATE TABLE tasks (id int);\n";

test("גיבוי דחוס, בשם עם התאריך", (t) => {
  const d = fakeDocker(t, [{ match: "^exec dev-db pg_dump", stdout: DUMP }]);
  const dir = path.join(tempDir(t), "my backups", "daily");
  const r = runScript(import.meta.url, "P23-E50.sh", ["dev-db", "shop", dir], { env: d.env });
  assert.equal(r.status, 0, r.stderr);
  const file = path.join(dir, `shop-${today()}.sql.gz`);
  assert.deepEqual(r.lines, [file], "מדפיס את הנתיב");
  assert.equal(zlib.gunzipSync(fs.readFileSync(file)).toString(), DUMP.replaceAll("\\n", "\n"));
  assert.deepEqual(d.calls(), [["exec", "dev-db", "pg_dump", "-U", "postgres", "shop"]]);
  assert.deepEqual(fs.readdirSync(dir), [path.basename(file)], "בלי קבצים זמניים שנשארו");
});
test("pg_dump נכשל ← exit 1, ואין קובץ", (t) => {
  const d = fakeDocker(t, [{ match: "pg_dump", stdout: "-- partial\n", stderr: "pg_dump: error: database \"nope\" does not exist\n", status: 1 }]);
  const dir = path.join(tempDir(t), "b");
  const r = runScript(import.meta.url, "P23-E50.sh", ["dev-db", "nope", dir], { env: d.env });
  assert.notEqual(r.status, 0);
  const left = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
  assert.deepEqual(left, [], "לא נשאר שום קובץ — גם לא חלקי או זמני (pipefail + קובץ זמני)");
});
test("ארגומנטים", (t) => {
  const d = fakeDocker(t, []);
  for (const args of [[], ["a"], ["a", "b"], ["a", "b", "c", "d"]]) assert.equal(runScript(import.meta.url, "P23-E50.sh", args, { env: d.env }).status, 2);
  assert.deepEqual(d.calls(), []);
});
