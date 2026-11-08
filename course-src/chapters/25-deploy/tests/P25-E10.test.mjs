import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { load } from "../../tools/load.mjs";

const { smokeTest } = await load(import.meta.url, "P25-E10.ts");
const SHA = "2cb197caebad857cf5eed6c8d1ddd582085d5dca";

// שרת מדומה: deploy שלוקח כמה ניסיונות
function server(t, { commits, readyFrom = 0 }) {
  let v = 0;
  let r = 0;
  const s = http.createServer((req, res) => {
    if (req.url === "/version") {
      const c = commits[Math.min(v++, commits.length - 1)];
      if (c === 503) return res.writeHead(503).end();
      if (c === "drop") return req.socket.destroy();
      return res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({ commit: c }));
    }
    if (req.url === "/ready") return res.writeHead(r++ >= readyFrom ? 200 : 503).end("{}");
    res.writeHead(404).end();
  });
  return new Promise((ok) => s.listen(0, "127.0.0.1", () => { t.after(() => { s.closeAllConnections(); s.close(); }); ok(`http://127.0.0.1:${s.address().port}`); }));
}

test("מחכה: 503, חיבור שנופל, גרסה ישנה — ואז החדשה ומוכנה", async (t) => {
  const base = await server(t, { commits: [503, "drop", "0ld0ld0", SHA], readyFrom: 1 });
  const r = await smokeTest(base, { expectCommit: SHA, intervalMs: 10, timeoutMs: 5000 });
  assert.deepEqual(r, { ok: true, attempts: 5, commit: SHA });
});
test("expectCommit מקוצר", async (t) => {
  const base = await server(t, { commits: [SHA] });
  assert.equal((await smokeTest(base, { expectCommit: "2cb197c", intervalMs: 10 })).ok, true);
});
test("בלי expectCommit — מספיק /version ו־/ready", async (t) => {
  const base = await server(t, { commits: ["whatever1"] });
  assert.deepEqual(await smokeTest(base, { intervalMs: 10 }), { ok: true, attempts: 1, commit: "whatever1" });
});
test("timeout — עם הגרסה האחרונה שנראתה", async (t) => {
  const base = await server(t, { commits: ["0ld0ld0"] });
  const clock = { t: 0 };
  const r = await smokeTest(base, { expectCommit: SHA, intervalMs: 5, timeoutMs: 100, now: () => (clock.t += 30) });
  assert.equal(r.ok, false);
  assert.equal(r.commit, "0ld0ld0");
  assert.ok(r.attempts >= 2 && r.attempts <= 4, `מספר ניסיונות לפי השעון (${r.attempts})`);
});
test("שרת שלא קיים", async () => {
  const r = await smokeTest("http://127.0.0.1:9", { intervalMs: 5, timeoutMs: 50 });
  assert.equal(r.ok, false);
  assert.equal(r.commit, null);
});
