import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P22-E100.ts", ["createFakeFetch"])).createFakeFetch;

test("routes קבועים ופונקציות, ו־Response אמיתי", async () => {
  const createFakeFetch = await get();
  let n = 0;
  const f = createFakeFetch({
    "GET /tasks": () => (++n === 1 ? { status: 401, body: { code: "INVALID_TOKEN" } } : { status: 200, body: [{ id: 1 }] }),
    "POST /auth/refresh": { status: 200, body: { accessToken: "A2" } },
    "DELETE /tasks/1": { status: 204 },
    "POST /echo": (req) => ({ status: 201, body: req.body }),
  });
  let r = await f("http://localhost:3000/tasks?page=2", { headers: { Authorization: "Bearer A1" } });
  assert.ok(r instanceof Response, "Response אמיתי");
  assert.equal(r.status, 401);
  assert.equal(r.ok, false);
  assert.deepEqual(await r.json(), { code: "INVALID_TOKEN" });
  r = await f("/tasks");
  assert.equal(r.headers.get("content-type"), "application/json");
  assert.deepEqual(await r.json(), [{ id: 1 }]);
  r = await f("/auth/refresh", { method: "post", body: JSON.stringify({ refreshToken: "R1" }), headers: { "Content-Type": "application/json" } });
  assert.deepEqual(await r.json(), { accessToken: "A2" });
  r = await f("/tasks/1", { method: "DELETE" });
  assert.equal(r.status, 204);
  assert.equal(await r.text(), "");
  r = await f("/echo", { method: "POST", body: JSON.stringify({ a: [1, 2] }) });
  assert.deepEqual([r.status, await r.json()], [201, { a: [1, 2] }]);
  assert.deepEqual(f.calls, [
    { method: "GET", path: "/tasks", headers: { authorization: "Bearer A1" }, body: undefined },
    { method: "GET", path: "/tasks", headers: {}, body: undefined },
    { method: "POST", path: "/auth/refresh", headers: { "content-type": "application/json" }, body: { refreshToken: "R1" } },
    { method: "DELETE", path: "/tasks/1", headers: {}, body: undefined },
    { method: "POST", path: "/echo", headers: {}, body: { a: [1, 2] } },
  ]);
});
test("route חסר ← 404", async () => {
  const createFakeFetch = await get();
  const f = createFakeFetch({ "GET /a": { status: 200, body: 1 } });
  const r = await f("/a", { method: "POST" });
  assert.equal(r.status, 404);
  assert.deepEqual(await r.json(), { error: "אין route ל־POST /a" });
  assert.equal((await f("https://api.example/x/y")).status, 404);
  assert.deepEqual(f.calls.map((c) => c.path), ["/a", "/x/y"]);
});
