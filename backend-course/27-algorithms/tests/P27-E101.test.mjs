import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { load, listen } from "../../tools/load.mjs";

const { smokeTest } = await load(import.meta.url, "P27-E101.ts");

test("כל סוגי הכישלון, במקביל", async (t) => {
  const server = http.createServer((req, res) => {
    if (req.url === "/health") return res.end('{"ok":true}');
    if (req.url === "/home") return res.end("<h1>חנות הקפה</h1>");
    if (req.url === "/broken") { res.statusCode = 500; return res.end("boom"); }
    if (req.url === "/slow") return setTimeout(() => res.end("late"), 300).unref?.();
    res.statusCode = 404; res.end();
  });
  const { base, close } = await listen(server);
  t.after(close);
  const t0 = Date.now();
  const r = await smokeTest(base, [
    { path: "/health", status: 200, contains: '"ok":true' },
    { path: "/home", status: 200, contains: "מבצע" },
    { path: "/broken", status: 200 },
    { path: "/slow", status: 200 },
    { path: "/slow", status: 200 },
    { path: "/missing", status: 404 },
  ], 150);
  const took = Date.now() - t0;
  assert.deepEqual(r, { ok: false, failures: [
    { path: "/home", reason: "missing text" },
    { path: "/broken", reason: "status 500" },
    { path: "/slow", reason: "timeout" },
    { path: "/slow", reason: "timeout" },
  ] });
  assert.ok(took < 280, `לקח ${took}ms — במקביל, עם timeout`);
  assert.deepEqual(await smokeTest(base, [{ path: "/health", status: 200 }], 500), { ok: true, failures: [] });
  assert.deepEqual(await smokeTest("http://127.0.0.1:1", [{ path: "/", status: 200 }], 500), { ok: false, failures: [{ path: "/", reason: "network" }] });
});
