import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P21-E55.ts";
const get = () => exportsOf(import.meta.url, FILE, ["createApiClient", "ApiError"]);

// שרת קטן: מחזיר את מה שקיבל, ובנתיבים מיוחדים — שגיאות
async function server(t) {
  const seen = [];
  const s = http.createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      seen.push({ method: req.method, url: req.url, auth: req.headers.authorization, type: req.headers["content-type"], body });
      if (req.url === "/gone") return res.writeHead(204).end();
      if (req.url === "/denied") return res.writeHead(401, { "content-type": "application/json" }).end(JSON.stringify({ code: "INVALID_TOKEN", message: "טוקן לא תקין" }));
      if (req.url === "/html") return res.writeHead(502, { "content-type": "text/html" }).end("<h1>Bad Gateway</h1>");
      if (req.url === "/missing") return res.writeHead(404, { "content-type": "application/json" }).end(JSON.stringify({ code: "TASK_NOT_FOUND", message: "משימה 9 לא נמצאה" }));
      res.writeHead(req.method === "POST" ? 201 : 200, { "content-type": "application/json" }).end(JSON.stringify({ method: req.method, url: req.url, got: body ? JSON.parse(body) : null }));
    });
  });
  await new Promise((r) => s.listen(0, "127.0.0.1", r));
  t.after(() => s.close());
  return { base: `http://127.0.0.1:${s.address().port}`, seen };
}

test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("טוקן מתעדכן, body כ־JSON", async (t) => {
  const { createApiClient } = await get();
  const { base, seen } = await server(t);
  let token = "first";
  const api = createApiClient(base, () => token);
  assert.deepEqual(await api.request("GET", "/tasks?page=2"), { method: "GET", url: "/tasks?page=2", got: null });
  token = "second";
  assert.deepEqual(await api.request("POST", "/tasks", { title: "חלב" }), { method: "POST", url: "/tasks", got: { title: "חלב" } });
  token = null;
  await api.request("GET", "/public");
  assert.deepEqual(seen.map((s) => s.auth), ["Bearer first", "Bearer second", undefined], "getToken() נקרא בכל בקשה; null ← בלי header");
  assert.equal(seen[1].type, "application/json");
  assert.equal(seen[0].type, undefined, "בלי body — בלי Content-Type");
  assert.equal(await api.request("DELETE", "/gone"), null, "204 ← null");
});
test("שגיאות ← ApiError", async (t) => {
  const { createApiClient, ApiError } = await get();
  const { base } = await server(t);
  const api = createApiClient(base, () => "x");
  await assert.rejects(api.request("GET", "/denied"), (err) => {
    assert.ok(err instanceof ApiError, "ApiError");
    assert.ok(err instanceof Error, "ApiError extends Error");
    assert.equal(err.status, 401);
    assert.equal(err.code, "INVALID_TOKEN");
    assert.equal(err.message, "טוקן לא תקין");
    return true;
  });
  await assert.rejects(api.request("GET", "/missing"), { status: 404, code: "TASK_NOT_FOUND", message: "משימה 9 לא נמצאה" });
  await assert.rejects(api.request("GET", "/html"), (err) => err instanceof ApiError && err.status === 502 && err.code === undefined && err.message === "HTTP 502");
});
