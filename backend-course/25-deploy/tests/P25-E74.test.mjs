import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import express from "express";
import { listen } from "../../tools/load.mjs";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25-E74.ts", ["requestOrigin"])).requestOrigin;

test("מקרים", async () => {
  const f = await get();
  assert.equal(f({ host: "localhost:3000" }, false), "http://localhost:3000");
  assert.equal(f({ host: "10.0.0.5:10000", forwardedHost: "tasks-api.onrender.com", forwardedProto: "https" }, true), "https://tasks-api.onrender.com");
  assert.equal(f({ host: "10.0.0.5:10000", forwardedHost: "evil.com", forwardedProto: "https" }, false), "http://10.0.0.5:10000", "בלי trust — מתעלמים");
  assert.equal(f({ host: "a", forwardedProto: "https, http" }, true), "https://a");
  assert.equal(f({ host: "a", forwardedHost: "b.com , c.com" }, true), "http://b.com");
  assert.equal(f({ host: "a", encrypted: true }, false), "https://a");
  assert.equal(f({ host: "a", encrypted: true, forwardedProto: "http" }, true), "http://a");
  assert.throws(() => f({}, false), { message: "אין Host" });
});
test("זהה ל־Express", async (t) => {
  const f = await get();
  for (const trust of [false, 1]) {
    const app = express();
    app.set("trust proxy", trust);
    app.get("/", (req, res) => res.json({ origin: `${req.protocol}://${req.host}` }));
    const { base, close } = await listen(app);
    t.after(close);
    const cases = [
      {},
      { "X-Forwarded-Proto": "https" },
      { "X-Forwarded-Proto": "https, http", "X-Forwarded-Host": "tasks-api.onrender.com" },
      { "X-Forwarded-Host": "a.example.com, b.example.com" },
    ];
    for (const extra of cases) {
      const headers = { Host: "internal:10000", ...extra };
      const { origin } = await new Promise((resolve, reject) => {
        http.get(base, { headers }, (res) => {
          let text = "";
          res.on("data", (c) => (text += c));
          res.on("end", () => resolve(JSON.parse(text)));
        }).on("error", reject);
      });
      const mine = f({ host: headers.Host, forwardedHost: extra["X-Forwarded-Host"], forwardedProto: extra["X-Forwarded-Proto"] }, trust === 1);
      assert.equal(mine, origin, `trust proxy ${trust}, ${JSON.stringify(extra)}`);
    }
  }
});
