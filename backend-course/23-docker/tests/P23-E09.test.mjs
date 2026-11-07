import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { filesDir, runScript, tempDir } from "../../tools/shell.mjs";

const logs = path.join(filesDir(import.meta.url), "logs");

const run = (env) => runScript(import.meta.url, "P23-E09.sh", [], { env, cleanEnv: true });
const SECRET = "x".repeat(32);

test("הכול קיים ← OK, exit 0", () => {
  const r = run({ DATABASE_URL: "postgresql://x@db/x", JWT_SECRET: SECRET });
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(r.lines, ["OK"]);
});
test("חסרים ← כל אחד בשורה, ל־stderr, exit 1", () => {
  const r = run({});
  assert.equal(r.status, 1);
  assert.match(r.stderr, /חסר: DATABASE_URL/);
  assert.match(r.stderr, /חסר: JWT_SECRET/);
  assert.equal(r.stdout.trim(), "", "הודעות שגיאה — ל־stderr, לא ל־stdout");
});
test("ריק נחשב חסר", () => {
  assert.equal(run({ DATABASE_URL: "", JWT_SECRET: SECRET }).status, 1);
});
test("סוד קצר", () => {
  const r = run({ DATABASE_URL: "x", JWT_SECRET: "short-secret" });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /JWT_SECRET קצר מדי \(12 תווים, צריך 32\)/);
  assert.equal(run({ DATABASE_URL: "x", JWT_SECRET: "y".repeat(31) }).status, 1, "31 — עדיין קצר");
});
