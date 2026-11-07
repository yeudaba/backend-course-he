import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen, api } from "../../tools/load.mjs";
import express from "express";

const { createLogger } = await load(import.meta.url, "P15-E09.ts");

test("לוג", async (t) => {
  const lines = [];
  const app = express();
  app.use(createLogger((l) => lines.push(l)));
  const r = express.Router();
  r.get("/items", (req, res) => setTimeout(() => res.json([]), 30));
  app.use("/api", r);
  app.use((req, res) => res.status(404).json({}));
  const { base, close } = await listen(app);
  t.after(close);
  const call = api(base);
  await call("GET", "/api/items?page=2");
  await call("POST", "/nope");
  await new Promise((r) => setTimeout(r, 20));
  assert.equal(lines.length, 2, "שורה לכל בקשה");
  const m = lines[0].match(/^GET \/api\/items\?page=2 200 (\d+)ms$/);
  assert.ok(m, `פורמט לא נכון: "${lines[0]}"`);
  assert.ok(Number(m[1]) >= 25, "הזמן צריך לכלול את זמן ה־handler");
  assert.match(lines[1], /^POST \/nope 404 \d+ms$/);
});
