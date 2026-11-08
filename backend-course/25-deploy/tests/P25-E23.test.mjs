import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen, api } from "../../tools/load.mjs";

const { createApp } = await load(import.meta.url, "P25-E23.ts");
async function start(t) {
  const { base, close } = await listen(createApp({ limit: 3 }));
  t.after(close);
  return api(base);
}

test("X-Forwarded-For מזויף לא עוקף", async (t) => {
  const call = await start(t);
  const codes = [];
  // כמו מאחורי proxy: הלקוח כתב כתובת מזויפת, ה־proxy הוסיף את האמיתית בסוף
  for (let i = 0; i < 5; i++) codes.push((await call("POST", "/login", {}, { headers: { "X-Forwarded-For": `10.9.9.${i}, 198.51.100.4` } })).status);
  assert.deepEqual(codes, [200, 200, 200, 429, 429]);
});
test("HSTS רק ב־HTTPS", async (t) => {
  const call = await start(t);
  assert.equal((await call("POST", "/login", {})).headers.get("strict-transport-security"), null, "חיבור HTTP רגיל");
  const viaProxy = await call("POST", "/login", {}, { headers: { "X-Forwarded-Proto": "https", "X-Forwarded-For": "198.51.100.5" } });
  assert.match(viaProxy.headers.get("strict-transport-security") ?? "", /max-age=/, "מאחורי ה־proxy, כשהלקוח הגיע ב־https");
});
test("בלי X-Powered-By", async (t) => {
  const call = await start(t);
  assert.equal((await call("POST", "/login", {})).headers.get("x-powered-by"), null);
});
