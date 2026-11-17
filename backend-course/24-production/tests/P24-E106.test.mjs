import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { listen } from "../../tools/load.mjs";
import { exportsOf } from "./_ts.mjs";

// שרת tasks קטן. mode: "ok" | "none" (בלי idempotency) | "noHeader" (replay בלי Idempotent-Replayed)
function server(mode) {
  const app = express();
  app.use(express.json());
  const keys = new Map();
  let nextId = 1;
  app.post("/tasks", (req, res) => {
    if (req.get("authorization") !== "Bearer tok") return res.status(401).json({ error: { code: "UNAUTHORIZED" } });
    const key = req.get("idempotency-key");
    const fp = JSON.stringify(req.body);
    if (mode !== "none" && key && keys.has(key)) {
      const saved = keys.get(key);
      if (saved.fp !== fp) return res.status(422).json({ error: { code: "IDEMPOTENCY_KEY_REUSED" } });
      if (mode === "ok") res.set("Idempotent-Replayed", "true");
      return res.status(201).json(saved.body);
    }
    const body = { id: nextId++, title: req.body.title };
    if (key) keys.set(key, { fp, body });
    res.status(201).json(body);
  });
  return app;
}
async function run(t, mode, token = "tok") {
  const { idempotencySmoke } = await exportsOf(import.meta.url, "P24-E106.ts", ["idempotencySmoke"]);
  const { base, close } = await listen(server(mode));
  t.after(close);
  return idempotencySmoke(base, token, `smoke-${mode}`);
}

test("שרת תקין", async (t) => {
  assert.deepEqual(await run(t, "ok"), { first: 201, second: 201, replayed: true, sameId: true, reused: 422, ok: true });
});
test("שרת בלי idempotency", async (t) => {
  assert.deepEqual(await run(t, "none"), { first: 201, second: 201, replayed: false, sameId: false, reused: 201, ok: false });
});
test("replay בלי header", async (t) => {
  assert.deepEqual(await run(t, "noHeader"), { first: 201, second: 201, replayed: false, sameId: true, reused: 422, ok: false });
});
test("טוקן שגוי — לא זורק", async (t) => {
  assert.deepEqual(await run(t, "ok", "bad"), { first: 401, second: 401, replayed: false, sameId: false, reused: 401, ok: false });
});
