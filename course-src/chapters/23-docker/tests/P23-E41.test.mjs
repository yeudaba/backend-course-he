import { test } from "node:test";
import assert from "node:assert/strict";
import { runScript } from "../../tools/shell.mjs";
import { fakeDocker } from "./_fakedocker.mjs";

test("ארגומנטים בדיוק כמו שהם", (t) => {
  const d = fakeDocker(t, []);
  const sqls = ["select count(*) from tasks", "select * from users where email = 'dana@example.com'", 'select "id", $1 from x', "  spaced  "];
  for (const sql of sqls) assert.equal(runScript(import.meta.url, "P23-E41.sh", ["demo-db", sql], { env: d.env }).status, 0);
  assert.deepEqual(d.calls(), sqls.map((sql) => ["exec", "demo-db", "psql", "-U", "postgres", "-d", "postgres", "-tAc", sql]));
});
test("DB מהסביבה, ו־exit code של docker", (t) => {
  const d = fakeDocker(t, [{ match: "nope", stderr: "Error: No such container: nope\n", status: 1 }]);
  assert.equal(runScript(import.meta.url, "P23-E41.sh", ["db 1", "select 1"], { env: { ...d.env, DB: "shop" } }).status, 0);
  assert.deepEqual(d.calls()[0], ["exec", "db 1", "psql", "-U", "postgres", "-d", "shop", "-tAc", "select 1"]);
  assert.notEqual(runScript(import.meta.url, "P23-E41.sh", ["nope", "select 1"], { env: d.env }).status, 0, "docker נכשל ← הסקריפט נכשל");
});
test("מספר ארגומנטים", (t) => {
  const d = fakeDocker(t, []);
  for (const args of [[], ["demo-db"], ["demo-db", "select", "1"]]) assert.equal(runScript(import.meta.url, "P23-E41.sh", args, { env: d.env }).status, 2, JSON.stringify(args));
  assert.deepEqual(d.calls(), []);
});
