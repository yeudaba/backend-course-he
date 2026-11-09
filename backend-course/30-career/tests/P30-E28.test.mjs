import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { redactForPrompt } = await load(import.meta.url, "P30-E28.ts");

test("כתובת חיבור: רק הסיסמה מוסתרת", () => {
  const r = redactForPrompt("DATABASE_URL=postgresql://app:S3cr3t!@db.example.com:5432/shop");
  assert.equal(r.text, "DATABASE_URL=postgresql://app:[REDACTED:url-password]@db.example.com:5432/shop");
  assert.deepEqual(r.found, ["url-password"]);
});
test("שורות .env עם שם של סוד — הערך מוסתר; שורות אחרות לא", () => {
  const r = redactForPrompt("PORT=3000\nJWT_SECRET=abc123\nDB_PASSWORD = hunter2\nSTRIPE_API_KEY=xyz\nNODE_ENV=production");
  assert.equal(r.text, "PORT=3000\nJWT_SECRET=[REDACTED:env-secret]\nDB_PASSWORD = [REDACTED:env-secret]\nSTRIPE_API_KEY=[REDACTED:env-secret]\nNODE_ENV=production");
  assert.deepEqual(r.found, ["env-secret"]);
});
test("מפתחות API, AWS, GitHub ו־JWT", () => {
  const jwt = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.c2lnbmF0dXJlX19f";
  const r = redactForPrompt(`a sk-ant-api03-AbCdEfGhIjKlMnOpQr b AKIAABCDEFGHIJKLMNOP c ghp_${"x".repeat(36)} d ${jwt}`);
  assert.equal(r.text, "a [REDACTED:api-key] b [REDACTED:aws-key] c [REDACTED:github-token] d [REDACTED:jwt]");
  assert.deepEqual(r.found, ["api-key", "aws-key", "github-token", "jwt"]);
});
test("Bearer: המילה נשארת, ה־token לא", () => {
  const r = redactForPrompt('curl -H "Authorization: Bearer abcDEF123456789" https://api.example.com');
  assert.equal(r.text, 'curl -H "Authorization: Bearer [REDACTED:bearer]" https://api.example.com');
});
test("מפתח פרטי — כל הבלוק", () => {
  const r = redactForPrompt("before\n-----BEGIN RSA PRIVATE KEY-----\nMIIEow\nAAAA\n-----END RSA PRIVATE KEY-----\nafter");
  assert.equal(r.text, "before\n[REDACTED:private-key]\nafter");
});
test("טקסט רגיל — לא נוגעים", () => {
  const text = "TypeError: Cannot read properties of undefined (reading 'id')\n    at TasksService.find (src/tasks/tasks.service.ts:42:18)\nsk-short and eyJ-not-a-token";
  assert.deepEqual(redactForPrompt(text), { text, found: [] });
});
