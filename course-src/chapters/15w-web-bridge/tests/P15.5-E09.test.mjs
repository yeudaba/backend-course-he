import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { load, listen } from "../../tools/load.mjs";

const { corsMiddleware } = await load(import.meta.url, "P15.5-E09.ts");

test("CORS", async (t) => {
  let handled = 0;
  const app = express();
  app.use(corsMiddleware(["http://localhost:5500"]));
  app.all("/tasks", (req, res) => { handled++; res.json({ ok: true }); });
  const { base, close } = await listen(app);
  t.after(close);
  const send = (method, headers) => fetch(base + "/tasks", { method, headers, signal: AbortSignal.timeout(2000) });

  let res = await send("GET", { Origin: "http://localhost:5500" });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("access-control-allow-origin"), "http://localhost:5500");
  assert.match(res.headers.get("vary") ?? "", /Origin/);

  res = await send("GET", { Origin: "https://evil.example" });
  assert.equal(res.status, 200, "בקשה רגילה ממשיכה גם מ־origin לא מורשה");
  assert.equal(res.headers.get("access-control-allow-origin"), null);
  assert.match(res.headers.get("vary") ?? "", /Origin/);

  const before = handled;
  res = await send("OPTIONS", { Origin: "http://localhost:5500", "Access-Control-Request-Method": "PATCH", "Access-Control-Request-Headers": "content-type,x-request-id" });
  assert.equal(res.status, 204);
  assert.equal(res.headers.get("access-control-allow-origin"), "http://localhost:5500");
  assert.equal(res.headers.get("access-control-allow-methods"), "GET,POST,PUT,PATCH,DELETE");
  assert.equal(res.headers.get("access-control-allow-headers"), "content-type,x-request-id");
  assert.equal(res.headers.get("access-control-max-age"), "600");
  assert.equal(handled, before, "preflight לא מגיע ל־route");

  res = await send("OPTIONS", { Origin: "http://localhost:5500", "Access-Control-Request-Method": "POST" });
  assert.equal(res.headers.get("access-control-allow-headers"), "Content-Type");

  res = await send("OPTIONS", { Origin: "https://evil.example", "Access-Control-Request-Method": "DELETE" });
  assert.equal(res.status, 204);
  assert.equal(res.headers.get("access-control-allow-origin"), null);
  assert.equal(res.headers.get("access-control-allow-methods"), null);
});
