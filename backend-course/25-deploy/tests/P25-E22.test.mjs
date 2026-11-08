import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { load } from "../../tools/load.mjs";

const { smokeCheck } = await load(import.meta.url, "P25-E22.ts");
function server(t, { versions, ready = true }) {
  let n = 0;
  const s = http.createServer((req, res) => {
    if (req.url === "/version") {
      const v = versions[Math.min(n++, versions.length - 1)];
      return v === null ? res.writeHead(503).end() : res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({ commit: v }));
    }
    if (req.url === "/ready") return res.writeHead(ready ? 200 : 503).end("{}");
    res.writeHead(404).end();
  });
  return new Promise((ok) => s.listen(0, "127.0.0.1", () => { t.after(() => { s.closeAllConnections(); s.close(); }); ok(`http://127.0.0.1:${s.address().port}`); }));
}

test("מחכה לגרסה החדשה", async (t) => {
  const base = await server(t, { versions: [null, null, "new1234"] });
  assert.equal(await smokeCheck(base, "new1234", { attempts: 5, intervalMs: 5 }), true);
});
test("הגרסה הישנה עונה 200 — זה לא הצלחה", async (t) => {
  const base = await server(t, { versions: ["old0000"] });
  assert.equal(await smokeCheck(base, "new1234", { attempts: 3, intervalMs: 5 }), false);
});
test("גרסה חדשה בלי מסד — לא הצלחה", async (t) => {
  const base = await server(t, { versions: ["new1234"], ready: false });
  assert.equal(await smokeCheck(base, "new1234", { attempts: 3, intervalMs: 5 }), false);
});
