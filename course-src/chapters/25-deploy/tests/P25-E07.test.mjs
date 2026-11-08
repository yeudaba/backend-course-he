import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { load, listen, api } from "../../tools/load.mjs";

const { securityHeaders } = await load(import.meta.url, "P25-E07.ts");
async function start(t, { trustProxy = false, opts } = {}) {
  const app = express();
  app.set("trust proxy", trustProxy);
  app.use(securityHeaders(opts));
  app.get("/", (req, res) => res.json({ ok: true }));
  const { base, close } = await listen(app);
  t.after(close);
  return api(base);
}

test("headers בכל תשובה", async (t) => {
  const call = await start(t);
  const r = await call("GET", "/");
  assert.equal(r.headers.get("x-content-type-options"), "nosniff");
  assert.equal(r.headers.get("x-frame-options"), "DENY");
  assert.equal(r.headers.get("referrer-policy"), "no-referrer");
  assert.equal(r.headers.get("cross-origin-resource-policy"), "same-site");
  assert.equal(r.headers.get("x-powered-by"), null, "בלי X-Powered-By: Express");
  assert.equal((await call("GET", "/nope")).headers.get("x-frame-options"), "DENY", "גם ב־404");
});
test("HSTS — לא על HTTP", async (t) => {
  const call = await start(t);
  assert.equal((await call("GET", "/")).headers.get("strict-transport-security"), null);
  assert.equal((await call("GET", "/", undefined, { headers: { "X-Forwarded-Proto": "https" } })).headers.get("strict-transport-security"), null, "בלי trust proxy — לא סומכים על X-Forwarded-Proto");
});
test("HSTS — מאחורי proxy מוכר שאומר https", async (t) => {
  const call = await start(t, { trustProxy: 1, opts: { hstsMaxAge: 600 } });
  const r = await call("GET", "/", undefined, { headers: { "X-Forwarded-Proto": "https" } });
  assert.equal(r.headers.get("strict-transport-security"), "max-age=600; includeSubDomains");
});
