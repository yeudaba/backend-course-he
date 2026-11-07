import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { load, listen } from "../../tools/load.mjs";

const { fetchWithRetry } = await load(import.meta.url, "P14-E19.mjs");

function flakyServer(statuses) {
  let i = 0;
  const server = http.createServer((req, res) => {
    const status = statuses[Math.min(i, statuses.length - 1)];
    i++;
    res.writeHead(status);
    res.end(String(status));
  });
  return { server, count: () => i };
}

test("מצליח בניסיון השלישי", async (t) => {
  const s = flakyServer([503, 500, 200]);
  const { base, close } = await listen(s.server);
  t.after(close);
  const res = await fetchWithRetry(base, {}, { retries: 2, delayMs: 5 });
  assert.equal(res.status, 200);
  assert.equal(s.count(), 3);
});
test("404 — בלי ניסיון חוזר", async (t) => {
  const s = flakyServer([404]);
  const { base, close } = await listen(s.server);
  t.after(close);
  assert.equal((await fetchWithRetry(base, {}, { retries: 3, delayMs: 5 })).status, 404);
  assert.equal(s.count(), 1);
});
test("נגמרו הניסיונות — התשובה האחרונה", async (t) => {
  const s = flakyServer([503]);
  const { base, close } = await listen(s.server);
  t.after(close);
  assert.equal((await fetchWithRetry(base, {}, { retries: 2, delayMs: 5 })).status, 503);
  assert.equal(s.count(), 3);
});
test("המתנה שמכפילה את עצמה", async (t) => {
  const s = flakyServer([429, 429, 200]);
  const { base, close } = await listen(s.server);
  t.after(close);
  const start = Date.now();
  await fetchWithRetry(base, {}, { retries: 2, delayMs: 60 });
  assert.ok(Date.now() - start >= 170, "צריך לחכות 60 ואז 120 מילישניות");
});
test("שגיאת רשת — נזרקת אחרי כל הניסיונות", async () => {
  const s = flakyServer([200]);
  const { base, close } = await listen(s.server);
  await close();
  await assert.rejects(fetchWithRetry(base, {}, { retries: 1, delayMs: 5 }), TypeError);
});
test("init מועבר ל־fetch", async (t) => {
  let method;
  const { base, close } = await listen(http.createServer((req, res) => { method = req.method; res.end(); }));
  t.after(close);
  await fetchWithRetry(base, { method: "DELETE" });
  assert.equal(method, "DELETE");
});
