import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { load, listen } from "../../tools/load.mjs";

const { createCors } = await load(import.meta.url, "P15.5-E12.ts");

async function setup(t, options) {
  const app = express();
  app.use(createCors(options));
  app.all("/x", (req, res) => res.json({ ok: true }));
  const { base, close } = await listen(app);
  t.after(close);
  return (method, headers = {}) => fetch(base + "/x", { method, headers, signal: AbortSignal.timeout(2000) });
}
const allow = ["https://app.example.com", "https://*.preview.example.com"];

test("origins מדויקים ו־wildcard", async (t) => {
  const send = await setup(t, { allow });
  for (const origin of ["https://app.example.com", "https://pr-42.preview.example.com", "https://abc.preview.example.com"]) {
    assert.equal((await send("GET", { Origin: origin })).headers.get("access-control-allow-origin"), origin, origin);
  }
  for (const origin of ["https://a.b.preview.example.com", "http://pr-42.preview.example.com", "https://preview.example.com", "https://preview.example.com.evil.io", "https://pr-42.previewXexample.com", "https://app.example.com.evil.io", "https://PR.preview.example.com"]) {
    const res = await send("GET", { Origin: origin });
    assert.equal(res.status, 200, origin);
    assert.equal(res.headers.get("access-control-allow-origin"), null, `לא אמור להיות מורשה: ${origin}`);
  }
});
test("credentials ו־Vary", async (t) => {
  const send = await setup(t, { allow, credentials: true });
  const res = await send("GET", { Origin: "https://app.example.com" });
  assert.equal(res.headers.get("access-control-allow-credentials"), "true");
  assert.match(res.headers.get("vary") ?? "", /Origin/);
  const plain = await (await setup(t, { allow }))("GET", { Origin: "https://app.example.com" });
  assert.equal(plain.headers.get("access-control-allow-credentials"), null);
});
test("preflight", async (t) => {
  const send = await setup(t, { allow, maxAge: 120 });
  let res = await send("OPTIONS", { Origin: "https://pr-1.preview.example.com", "Access-Control-Request-Method": "DELETE", "Access-Control-Request-Headers": "authorization" });
  assert.equal(res.status, 204);
  assert.equal(res.headers.get("access-control-allow-methods"), "GET,POST,PUT,PATCH,DELETE");
  assert.equal(res.headers.get("access-control-allow-headers"), "authorization");
  assert.equal(res.headers.get("access-control-max-age"), "120");
  res = await send("OPTIONS", { Origin: "https://evil.io", "Access-Control-Request-Method": "DELETE" });
  assert.equal(res.status, 403);
  assert.equal((await res.json()).error.code, "CORS_ORIGIN_NOT_ALLOWED");
});
test("בלי Origin — לא נוגעים", async (t) => {
  const send = await setup(t, { allow });
  const res = await send("GET");
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("access-control-allow-origin"), null);
  assert.equal(res.headers.get("vary"), null);
});
