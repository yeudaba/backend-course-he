import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { listen, api } from "../../tools/load.mjs";
import { exportsOf } from "./_ts.mjs";
import { typesOk } from "./_app.mjs";

const FILE = "P15-E50.ts";
const ERR = { error: { code: "MAINTENANCE", message: "השירות בתחזוקה, נסה שוב בעוד דקה" } };
async function start(t, ...args) {
  const { maintenance } = await exportsOf(import.meta.url, FILE, ["maintenance"]);
  const app = express();
  app.use(maintenance(...args));
  app.use((req, res) => {
    res.json({ path: req.path });
  });
  const { base, close } = await listen(app);
  t.after(close);
  return api(base);
}
test("עובר בדיקת טיפוסים", () => typesOk(import.meta.url, FILE));
test("נקרא בכל בקשה — אפשר להדליק ולכבות", async (t) => {
  let on = false;
  let calls = 0;
  const call = await start(t, () => {
    calls++;
    return on;
  });
  assert.equal((await call("GET", "/orders")).status, 200);
  on = true;
  const r = await call("POST", "/orders", {});
  assert.deepEqual([r.status, r.body], [503, ERR]);
  assert.equal(r.headers.get("retry-after"), "60");
  assert.equal((await call("GET", "/health")).status, 200, "/health פתוח כברירת מחדל");
  assert.equal((await call("GET", "/health/db")).status, 503, "רק התאמה מדויקת");
  on = false;
  assert.equal((await call("GET", "/orders")).status, 200);
  assert.ok(calls >= 4, "isOn() נקראת בכל בקשה");
});
test("allow משלך", async (t) => {
  const call = await start(t, () => true, { allow: ["/status", "/login"] });
  assert.equal((await call("GET", "/status")).status, 200);
  assert.equal((await call("POST", "/login", {})).status, 200);
  assert.equal((await call("GET", "/health")).status, 503, "allow שהועבר מחליף את ברירת המחדל");
});
