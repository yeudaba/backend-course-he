import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { load } from "../../tools/load.mjs";

const { createGracefulShutdown } = await load(import.meta.url, "P26.3-E67.ts");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test("לא מוכן מיד, ממשיך לענות בזמן ה־drain, מחכה לבקשות, ורק אז סוגר משאבים", async (t) => {
  const log = [];
  let gs;
  const server = http.createServer(async (req, res) => {
    if (req.url === "/ready") return res.writeHead(gs.isReady() ? 200 : 503).end();
    if (req.url === "/slow") { await sleep(250); log.push("slow done"); }
    res.end("ok");
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  t.after(() => { server.closeAllConnections?.(); server.close(); });
  const base = `http://127.0.0.1:${server.address().port}`;
  gs = createGracefulShutdown({ server, drainMs: 150, closeResources: async () => { log.push("resources closed"); } });

  assert.equal(gs.isReady(), true);
  assert.equal((await fetch(base + "/ready")).status, 200);
  const slow = fetch(base + "/slow", { headers: { connection: "close" } }).then((r) => r.text());
  await sleep(20);
  const p1 = gs.shutdown();
  const p2 = gs.shutdown();
  assert.equal(p1, p2, "קריאה שנייה — אותו Promise");
  assert.equal(gs.isReady(), false, "לא מוכן — מיד");
  await sleep(40);
  const during = await fetch(base + "/ready", { headers: { connection: "close" } });
  assert.equal(during.status, 503, "בזמן ה־drain השרת עדיין עונה (503 ב־/ready)");
  assert.equal(await (await fetch(base + "/", { headers: { connection: "close" } })).text(), "ok", "ובקשות רגילות עדיין עובדות");
  assert.deepEqual(log, [], "עוד לא סגרו כלום");
  await p1;
  assert.equal(await slow, "ok", "הבקשה האיטית הסתיימה");
  assert.deepEqual(log, ["slow done", "resources closed"], "משאבים — אחרי שהבקשות הסתיימו");
  await assert.rejects(fetch(base + "/"), "אחרי הכיבוי — לא מקבלים חיבורים");
});
