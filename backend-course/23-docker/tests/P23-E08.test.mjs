import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { filesDir, runScript, tempDir } from "../../tools/shell.mjs";

const logs = path.join(filesDir(import.meta.url), "logs");

test("סכום לכל לקוח, מהגדול לקטן", () => {
  const r = runScript(import.meta.url, "P23-E08.sh", [path.join(logs, "orders.csv")]);
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(r.lines, ["rona 300.00", "dana 200.00", "yossi 55.25", "avi 0.00"]);
});
test("רק שורת כותרת ← כלום", () => {
  const r = runScript(import.meta.url, "P23-E08.sh", [path.join(logs, "empty.csv")]);
  assert.equal(r.status, 0);
  assert.deepEqual(r.lines, []);
});
test("הכותרת לא נחשבת ללקוח", (t) => {
  const dir = tempDir(t);
  fs.writeFileSync(path.join(dir, "o.csv"), "id,customer,amount\n1,zed,5\n");
  assert.deepEqual(runScript(import.meta.url, "P23-E08.sh", [path.join(dir, "o.csv")]).lines, ["zed 5.00"]);
});
