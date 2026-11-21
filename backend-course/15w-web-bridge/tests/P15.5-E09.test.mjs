import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { load, listen } from "../../tools/load.mjs";

const { corsMiddleware } = await load(import.meta.url, "P15.5-E09.ts");

// אפליקציה עם ה־middleware שלך ו־route אחד שסופר כמה פעמים הגיעו אליו
async function start(t, origins) {
  const counter = { handled: 0 };
  const app = express();
  app.use(corsMiddleware(origins));
  app.all("/tasks", (req, res) => {
    counter.handled++;
    res.json({ ok: true });
  });
  const { base, close } = await listen(app);
  t.after(close);
  const send = (method, headers) => fetch(base + "/tasks", { method, headers, signal: AbortSignal.timeout(2000) });
  return { send, counter };
}
const PAGE = "http://localhost:5500";

test("GET מ־origin מורשה ← Allow-Origin ו־Vary", async (t) => {
  const { send } = await start(t, [PAGE]);
  const res = await send("GET", { Origin: PAGE });
  assert.equal(res.status, 200, `GET עם Origin: ${PAGE}`);
  assert.equal(res.headers.get("access-control-allow-origin"), PAGE, `GET עם Origin: ${PAGE} — Access-Control-Allow-Origin צריך להיות אותו origin`);
  assert.match(res.headers.get("vary") ?? "", /Origin/, "Vary: Origin — תמיד");
});
test("GET מ־origin לא מורשה ← ממשיך, בלי Allow-Origin", async (t) => {
  const { send, counter } = await start(t, [PAGE]);
  const res = await send("GET", { Origin: "https://evil.example" });
  assert.equal(res.status, 200, "בקשה רגילה ממשיכה גם מ־origin לא מורשה — הדפדפן הוא שיחסום");
  assert.equal(counter.handled, 1, "הבקשה הגיעה ל־route (next())");
  assert.equal(res.headers.get("access-control-allow-origin"), null, "GET עם Origin: https://evil.example — בלי Access-Control-Allow-Origin");
  assert.match(res.headers.get("vary") ?? "", /Origin/, "Vary: Origin — גם כשה־origin לא מורשה");
  const noOrigin = await send("GET", {});
  assert.equal(noOrigin.status, 200, "בקשה בלי Origin (curl) — ממשיכה");
  assert.equal(noOrigin.headers.get("access-control-allow-origin"), null, "בקשה בלי Origin — בלי Access-Control-Allow-Origin");
});
test("רשימת origins מהפרמטר, לא קבועה בקוד", async (t) => {
  const { send } = await start(t, ["https://a.example", "https://b.example"]);
  for (const origin of ["https://a.example", "https://b.example"]) {
    assert.equal((await send("GET", { Origin: origin })).headers.get("access-control-allow-origin"), origin, `corsMiddleware(["https://a.example", "https://b.example"]) ו־Origin: ${origin}`);
  }
  assert.equal((await send("GET", { Origin: PAGE })).headers.get("access-control-allow-origin"), null, `${PAGE} לא ברשימה הזו`);
  assert.equal((await send("GET", { Origin: "https://a.example.evil.io" })).headers.get("access-control-allow-origin"), null, "השוואה מדויקת — לא startsWith");
});
test("preflight ממורשה ← 204 עם methods, headers ו־max-age, בלי להגיע ל־route", async (t) => {
  const { send, counter } = await start(t, [PAGE]);
  const res = await send("OPTIONS", { Origin: PAGE, "Access-Control-Request-Method": "PATCH", "Access-Control-Request-Headers": "content-type,x-request-id" });
  assert.equal(res.status, 204, "preflight ← 204");
  assert.equal(res.headers.get("access-control-allow-origin"), PAGE);
  assert.equal(res.headers.get("access-control-allow-methods"), "GET,POST,PUT,PATCH,DELETE");
  assert.equal(res.headers.get("access-control-allow-headers"), "content-type,x-request-id", "Allow-Headers = מה שהדפדפן ביקש ב־Access-Control-Request-Headers");
  assert.equal(res.headers.get("access-control-max-age"), "600");
  assert.equal(counter.handled, 0, "preflight לא מגיע ל־route");
  const plain = await send("OPTIONS", { Origin: PAGE, "Access-Control-Request-Method": "POST" });
  assert.equal(plain.headers.get("access-control-allow-headers"), "Content-Type", "בלי Access-Control-Request-Headers ← Allow-Headers: Content-Type");
});
test("preflight מ־origin לא מורשה ← 204 בלי הרשאות", async (t) => {
  const { send, counter } = await start(t, [PAGE]);
  const res = await send("OPTIONS", { Origin: "https://evil.example", "Access-Control-Request-Method": "DELETE" });
  assert.equal(res.status, 204, "preflight מ־origin לא מורשה — גם הוא נענה מיד (204)");
  assert.equal(res.headers.get("access-control-allow-origin"), null);
  assert.equal(res.headers.get("access-control-allow-methods"), null, "בלי Access-Control-Allow-Methods ל־origin לא מורשה");
  assert.equal(counter.handled, 0, "preflight לא מגיע ל־route");
});
