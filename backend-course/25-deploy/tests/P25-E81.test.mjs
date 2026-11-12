import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { listen } from "../../tools/load.mjs";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25-E81.ts", ["auditHeaders"])).auditHeaders;
const GOOD = { "X-Content-Type-Options": "nosniff", "X-Frame-Options": "DENY", "Strict-Transport-Security": "max-age=15552000; includeSubDomains" };

test("תקין", async () => {
  const f = await get();
  assert.deepEqual(f(GOOD, { https: true }), []);
  assert.deepEqual(f({ "x-content-type-options": "NOSNIFF", "content-security-policy": "default-src 'self'; frame-ancestors 'none'" }, { https: false }), []);
  assert.deepEqual(f({ ...GOOD, "X-Frame-Options": "sameorigin" }, { https: true }), []);
});
test("כל הממצאים, בסדר", async () => {
  const f = await get();
  assert.deepEqual(f({ "X-Powered-By": "Express" }, { https: true }), ["missing-nosniff", "missing-frame-protection", "x-powered-by", "hsts-missing"]);
  assert.deepEqual(f({ ...GOOD, "x-frame-options": "ALLOWALL" }, { https: false }), ["missing-frame-protection", "hsts-on-http"]);
  assert.deepEqual(f({ ...GOOD, "Strict-Transport-Security": "max-age=300" }, { https: true }), ["hsts-too-short"]);
  assert.deepEqual(f({ ...GOOD, "Strict-Transport-Security": "includeSubDomains" }, { https: true }), ["hsts-too-short"]);
});
test("על תשובה אמיתית של Express", async (t) => {
  const f = await get();
  const app = express();
  app.get("/", (req, res) => res.json({}));
  const { base, close } = await listen(app);
  t.after(close);
  const res = await fetch(base);
  assert.deepEqual(f(Object.fromEntries(res.headers), { https: false }), ["missing-nosniff", "missing-frame-protection", "x-powered-by"]);
});
