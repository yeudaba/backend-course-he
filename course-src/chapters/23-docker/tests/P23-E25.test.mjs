import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { runScriptAsync } from "../../tools/shell.mjs";

test("שרת שעולה אחרי כשנייה וחצי ← exit 0", async (t) => {
  const started = Date.now();
  const server = http.createServer((req, res) => {
    res.statusCode = Date.now() - started > 1500 ? 200 : 503;
    res.end("ok");
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  t.after(() => server.close());
  const url = `http://127.0.0.1:${server.address().port}/health`;
  const before = Date.now();
  const r = await runScriptAsync(import.meta.url, "P23-E25.sh", [url, "15"]);
  assert.equal(r.status, 0, r.stderr);
  assert.ok(Date.now() - before < 8000, "לא מחכה יותר ממה שצריך");
  assert.match(r.stdout, /עונה/);
});
test("אין שרת ← exit 1 אחרי בערך הזמן שנקבע", async () => {
  const before = Date.now();
  const r = await runScriptAsync(import.meta.url, "P23-E25.sh", ["http://127.0.0.1:9/health", "2"]);
  const took = Date.now() - before;
  assert.equal(r.status, 1);
  assert.ok(took >= 1500 && took < 7000, `לקח ${took}ms`);
  assert.match(r.stderr, /לא ענה תוך 2 שניות/);
});
test("בלי ארגומנטים ← exit 2", async () => {
  assert.equal((await runScriptAsync(import.meta.url, "P23-E25.sh", [])).status, 2);
});
