import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { files } from "./_secrets.mjs";

const { findSecrets } = await load(import.meta.url, "P30-E08.ts");
const sorted = (f) => f.map((x) => `${x.path}:${x.line}:${x.kind}`).sort();

test("מוצא קובצי .env (לא .example), מפתחות, וסיסמאות אמיתיות — עם מספר שורה", () => {
  assert.deepEqual(sorted(findSecrets(files)), [
    ".env:0:env-file",
    ".env:1:db-password",
    ".env:2:jwt-secret",
    "config/.env.production:0:env-file",
    "src/ai.ts:3:anthropic-key",
  ]);
});
test("AWS ו־private key", () => {
  const r = findSecrets([{ path: "deploy.sh", content: "export AWS_KEY=AKIAABCDEFGHIJKLMNOP\n-----BEGIN RSA PRIVATE KEY-----" }]);
  assert.deepEqual(sorted(r), ["deploy.sh:1:aws-key", "deploy.sh:2:private-key"]);
});
test("לא מתריע על placeholders ועל node_modules", () => {
  assert.deepEqual(findSecrets([files[1], files[4], files[5]]), []);
});
