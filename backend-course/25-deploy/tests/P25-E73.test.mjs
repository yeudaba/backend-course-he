import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import express from "express";
import { listen } from "../../tools/load.mjs";
import { exportsOf } from "./_ts.mjs";

async function start(t, opts) {
  const { requireHttps } = await exportsOf(import.meta.url, "P25-E73.ts", ["requireHttps"]);
  const app = express();
  app.set("trust proxy", 1);
  app.use(requireHttps(opts));
  app.all("/{*path}", (req, res) => res.json({ ok: true, path: req.originalUrl }));
  const { base, close } = await listen(app);
  t.after(close);
  // http.request ולא fetch — כדי לשלוח Host משלנו
  return (method, path, proto) =>
    new Promise((resolve, reject) => {
      const req = http.request(base + path, { method, headers: { Host: "api.example.com", ...(proto ? { "X-Forwarded-Proto": proto } : {}) } }, (res) => {
        let text = "";
        res.on("data", (c) => (text += c));
        res.on("end", () => resolve({ status: res.statusCode, headers: { get: (n) => res.headers[n.toLowerCase()] ?? null }, json: async () => JSON.parse(text) }));
      });
      req.on("error", reject);
      req.end();
    });
}

test("HTTPS ← עובר", async (t) => {
  const call = await start(t);
  for (const m of ["GET", "POST", "DELETE"]) {
    const r = await call(m, "/tasks?x=1", "https");
    assert.equal(r.status, 200, m);
  }
});
test("GET/HEAD ב־HTTP ← 308 עם אותו נתיב ו־query", async (t) => {
  const call = await start(t);
  const r = await call("GET", "/tasks/7?view=full", "http");
  assert.equal(r.status, 308);
  assert.equal(r.headers.get("location"), "https://api.example.com/tasks/7?view=full");
  const h = await call("HEAD", "/", undefined);
  assert.equal(h.status, 308);
  assert.equal(h.headers.get("location"), "https://api.example.com/");
});
test("POST ב־HTTP ← 403", async (t) => {
  const call = await start(t);
  for (const m of ["POST", "PUT", "PATCH", "DELETE"]) {
    const r = await call(m, "/auth/login", "http");
    assert.equal(r.status, 403, m);
    const body = await r.json();
    assert.equal(body.error.code, "HTTPS_REQUIRED");
    assert.equal(typeof body.error.message, "string");
  }
});
test("exclude", async (t) => {
  const call = await start(t);
  assert.equal((await call("GET", "/health", "http")).status, 200);
  assert.equal((await call("GET", "/ready?x=1", "http")).status, 200, "בלי query");
  assert.equal((await call("GET", "/healthz", "http")).status, 308);
  const custom = await start(t, { exclude: ["/metrics"] });
  assert.equal((await custom("GET", "/metrics", "http")).status, 200);
  assert.equal((await custom("GET", "/health", "http")).status, 308, "הרשימה שלך מחליפה את ברירת המחדל");
});
