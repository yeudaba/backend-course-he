import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P21-E81.ts", ["corsAllowlist"])).corsAllowlist;
const OK = "https://tasks.example";

async function app(t) {
  const corsAllowlist = await get();
  const a = express();
  let hits = 0;
  a.use(corsAllowlist([OK, "http://localhost:5500"]));
  a.all("/tasks", (req, res) => { hits++; res.json({ ok: true }); });
  const server = await new Promise((r) => { const s = a.listen(0, "127.0.0.1", () => r(s)); });
  t.after(() => server.close());
  const base = `http://127.0.0.1:${server.address().port}`;
  return { hits: () => hits, req: (method, headers = {}) => fetch(base + "/tasks", { method, headers }) };
}

test("origin מותר", async (t) => {
  const { req } = await app(t);
  const r = await req("GET", { origin: OK });
  assert.equal(r.status, 200);
  assert.equal(r.headers.get("access-control-allow-origin"), OK);
  assert.equal(r.headers.get("access-control-allow-credentials"), "true");
  assert.match(r.headers.get("vary") ?? "", /Origin/);
  const r2 = await req("GET", { origin: "http://localhost:5500" });
  assert.equal(r2.headers.get("access-control-allow-origin"), "http://localhost:5500");
});
test("origin לא מותר / בלי origin", async (t) => {
  const { req, hits } = await app(t);
  for (const origin of ["https://evil.example", "https://eviltasks.example", "https://tasks.example.evil.com", "http://tasks.example", "null"]) {
    const r = await req("GET", { origin });
    assert.equal(r.status, 200, "בקשה רגילה ממשיכה (CORS הוא לא מנגנון הרשאות)");
    assert.equal(r.headers.get("access-control-allow-origin"), null, `${origin} — בלי Allow-Origin`);
    assert.equal(r.headers.get("access-control-allow-credentials"), null);
    assert.match(r.headers.get("vary") ?? "", /Origin/, "Vary: Origin תמיד");
  }
  const curl = await req("GET");
  assert.equal(curl.status, 200);
  assert.equal(curl.headers.get("access-control-allow-origin"), null);
  assert.equal(hits(), 6);
});
test("preflight", async (t) => {
  const { req, hits } = await app(t);
  const r = await req("OPTIONS", { origin: OK, "access-control-request-method": "PATCH", "access-control-request-headers": "authorization, content-type" });
  assert.equal(r.status, 204);
  assert.equal(r.headers.get("access-control-allow-origin"), OK);
  assert.equal(r.headers.get("access-control-allow-methods"), "GET, POST, PATCH, DELETE");
  assert.equal(r.headers.get("access-control-allow-headers"), "Authorization, Content-Type");
  const bad = await req("OPTIONS", { origin: "https://evil.example", "access-control-request-method": "DELETE" });
  assert.equal(bad.status, 403);
  assert.equal(bad.headers.get("access-control-allow-origin"), null);
  assert.equal(bad.headers.get("access-control-allow-methods"), null);
  assert.equal(hits(), 0, "preflight לא מגיע ל־route");
});
