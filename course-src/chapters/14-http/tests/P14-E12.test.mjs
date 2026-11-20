import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { load, listen } from "../../tools/load.mjs";

const { getJson } = await load(import.meta.url, "P14-E12.mjs");

let slowAborted = false;
test("getJson", async (t) => {
  const server = http.createServer((req, res) => {
    if (req.url === "/slow") {
      res.on("close", () => { if (!res.writableEnded) slowAborted = true; });
      return setTimeout(() => res.end("{}"), 800);
    }
    res.writeHead(req.url === "/ok" ? 200 : 404, { "Content-Type": "application/json" });
    res.end(JSON.stringify(req.url === "/ok" ? { a: 1 } : { error: "x" }));
  });
  const { base, close } = await listen(server);
  t.after(close);

  await t.test("2xx", async () => assert.deepEqual(await getJson(base + "/ok"), { a: 1 }));
  await t.test("404", () => assert.rejects(getJson(base + "/nope"), { message: "HTTP 404" }));
  await t.test("timeout", () => assert.rejects(getJson(base + "/slow", { timeoutMs: 100 }), { name: "TimeoutError" }));
  await t.test("timeout מבטל את הבקשה עצמה (signal), לא רק מפסיק לחכות", async () => {
    slowAborted = false;
    await assert.rejects(getJson(base + "/slow", { timeoutMs: 100 }), { name: "TimeoutError" });
    for (let i = 0; i < 40 && !slowAborted; i++) await new Promise((r) => setTimeout(r, 10));
    assert.ok(slowAborted, "השרת לא ראה ביטול — הבקשה ממשיכה לרוץ ברקע. העבר ל־fetch את signal: AbortSignal.timeout(timeoutMs) במקום Promise.race");
  });
});
