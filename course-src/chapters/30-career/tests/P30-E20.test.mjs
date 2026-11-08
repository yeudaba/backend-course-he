import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { files } from "./_secrets.mjs";

const { findSecrets } = await load(import.meta.url, "P30-E20.ts");

test("כל קובץ .env (לא .example) — כולל .env.production", () => {
  const envs = findSecrets(files).filter((f) => f.kind === "env-file").map((f) => f.path).sort();
  assert.deepEqual(envs, [".env", "config/.env.production"]);
});
test("מספרי שורות מ־1", () => {
  const key = findSecrets(files).find((f) => f.kind === "anthropic-key");
  assert.equal(key.line, 3);
});
test("placeholder של סיסמה — לא התראה", () => {
  const dbs = findSecrets(files).filter((f) => f.kind === "db-password").map((f) => f.path);
  assert.deepEqual(dbs, [".env"]);
});
