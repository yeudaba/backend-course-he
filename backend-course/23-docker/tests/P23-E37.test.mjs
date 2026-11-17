import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { runScriptAsync } from "../../tools/shell.mjs";

const FILE = "P23-E37.sh";
async function server(t) {
  const s = http.createServer((req, res) => {
    if (req.url === "/health") return res.writeHead(200, { "content-type": "application/json" }).end('{"ok":true,"db":"up"}');
    if (req.url === "/sick") return res.writeHead(200, { "content-type": "application/json" }).end('{"ok":false}');
    if (req.url === "/boom") return res.writeHead(503, { "content-type": "application/json" }).end('{"ok":true}');
    if (req.url === "/slow") return setTimeout(() => res.end('{"ok":true}'), 6000);
    res.writeHead(404).end();
  });
  await new Promise((r) => s.listen(0, "127.0.0.1", r));
  t.after(() => { s.closeAllConnections(); s.close(); });
  return `http://127.0.0.1:${s.address().port}`;
}

test("בריא ← OK", async (t) => {
  const base = await server(t);
  const r = await runScriptAsync(import.meta.url, FILE, [`${base}/health`]);
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(r.lines, ["OK"]);
});
test("לא בריא ← FAIL ל־stderr, exit 1", { timeout: 20000 }, async (t) => {
  const base = await server(t);
  for (const p of ["/sick", "/boom", "/missing"]) {
    const r = await runScriptAsync(import.meta.url, FILE, [`${base}${p}`]);
    assert.equal(r.status, 1, `${p}: exit 1`);
    assert.deepEqual(r.lines, [], `${p}: בלי פלט ב־stdout`);
    assert.match(r.stderr, /^FAIL: /m, `${p}: "FAIL: ..." ב־stderr`);
  }
  const r503 = await runScriptAsync(import.meta.url, FILE, [`${base}/boom`]);
  assert.match(r503.stderr, /503/, "503 — הסיבה מ־curl (curl -f)");
  const sick = await runScriptAsync(import.meta.url, FILE, [`${base}/sick`]);
  assert.match(sick.stderr, /FAIL: body without "ok":true/);
  const t0 = Date.now();
  const slow = await runScriptAsync(import.meta.url, FILE, [`${base}/slow`], { timeout: 15000 });
  assert.equal(slow.status, 1);
  assert.ok(Date.now() - t0 < 5500, "--max-time 3");
  const down = await runScriptAsync(import.meta.url, FILE, ["http://127.0.0.1:1/health"]);
  assert.equal(down.status, 1);
});
test("בלי ארגומנט ← exit 2", async () => {
  const r = await runScriptAsync(import.meta.url, FILE, []);
  assert.equal(r.status, 2);
});
