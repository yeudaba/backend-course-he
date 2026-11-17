import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { spawn } from "node:child_process";
import { target } from "../../tools/load.mjs";

const FILE = target(import.meta.url, "P25-E100.mjs");
function run(env) {
  return new Promise((resolve) => {
    const started = Date.now();
    const p = spawn(process.execPath, [FILE], { env: { ...process.env, ...env } });
    let out = "";
    let err = "";
    p.stdout.on("data", (c) => (out += c));
    p.stderr.on("data", (c) => (err += c));
    const killer = setTimeout(() => p.kill("SIGKILL"), 6000);
    p.on("close", (code) => {
      clearTimeout(killer);
      resolve({ code, out, err, ms: Date.now() - started });
    });
  });
}
async function server(t, handler) {
  const s = http.createServer(handler);
  await new Promise((r) => s.listen(0, "127.0.0.1", r));
  t.after(() => { s.closeAllConnections(); s.close(); });
  return s.address().port;
}

test("200 ← exit 0, בלי פלט", async (t) => {
  const seen = [];
  const port = await server(t, (req, res) => { seen.push(req.url); res.end("ok"); });
  const r = await run({ PORT: String(port) });
  assert.equal(r.code, 0, r.err);
  assert.equal(r.out + r.err, "");
  assert.deepEqual(seen, ["/health"]);
});
test("503 ← exit 1 עם הודעה", async (t) => {
  const port = await server(t, (req, res) => { res.statusCode = 503; res.end(); });
  const r = await run({ PORT: String(port) });
  assert.equal(r.code, 1);
  assert.ok(r.err.trim().length > 0, "הודעה ל־stderr");
});
test("אין שרת ← exit 1", async (t) => {
  const port = await server(t, () => {});
  const free = port + 1;
  const r = await run({ PORT: String(free) });
  assert.equal(r.code, 1);
});
test("שרת תקוע ← exit 1 תוך כ־2 שניות", async (t) => {
  const port = await server(t, () => {});
  const r = await run({ PORT: String(port) });
  assert.equal(r.code, 1);
  assert.ok(r.ms >= 1500 && r.ms < 4500, `לקח ${r.ms}ms`);
});
