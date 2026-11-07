import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { createApp } = await load(import.meta.url, "P14-E24.mjs");

async function start(t, setup) {
  const app = createApp();
  setup(app);
  const server = app.listen(0);
  await new Promise((r) => (server.listening ? r() : server.once("listening", r)));
  t.after(() => new Promise((r) => { server.closeAllConnections(); server.close(r); }));
  const base = `http://127.0.0.1:${server.address().port}`;
  return (method, path, body, raw) =>
    fetch(base + path, {
      method,
      headers: body !== undefined || raw ? { "Content-Type": "application/json" } : {},
      body: raw ?? (body === undefined ? undefined : JSON.stringify(body)),
      signal: AbortSignal.timeout(2000),
    });
}

test("routes, params, query, body", async (t) => {
  const req = await start(t, (app) => {
    app.get("/products/:id", (req, res) => res.json({ id: req.params.id, sort: req.query.sort }));
    app.post("/products", (req, res) => res.status(201).json({ got: req.body }));
    app.delete("/products/:id", (req, res) => res.status(204).json());
    app.put("/x", (req, res) => res.json("put"));
    app.patch("/x", (req, res) => res.json("patch"));
  });
  let res = await req("GET", "/products/7?sort=price");
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("content-type"), "application/json; charset=utf-8");
  assert.deepEqual(await res.json(), { id: "7", sort: "price" });

  res = await req("POST", "/products", { name: "מסך" });
  assert.equal(res.status, 201);
  assert.deepEqual(await res.json(), { got: { name: "מסך" } });

  res = await req("DELETE", "/products/7");
  assert.equal(res.status, 204);
  assert.equal(await res.text(), "");
  assert.equal(await (await req("PUT", "/x")).json(), "put");
  assert.equal(await (await req("PATCH", "/x")).json(), "patch");

  assert.equal((await req("POST", "/products", undefined, "{oops")).status, 400);
  res = await req("GET", "/nope");
  assert.equal(res.status, 404);
  assert.deepEqual(await res.json(), { error: "לא נמצא" });
  assert.equal((await req("PUT", "/products/7")).status, 405);
});

test("middleware", async (t) => {
  const log = [];
  const req = await start(t, (app) => {
    app.use((req, res, next) => { log.push(`${req.method} ${req.path}`); next(); });
    app.use((req, res, next) => {
      if (req.query.key !== "secret") return res.status(401).json({ error: "אין גישה" });
      next();
    });
    app.get("/data", (req, res) => res.json({ ok: true }));
  });
  assert.equal((await req("GET", "/data")).status, 401);
  assert.deepEqual(await (await req("GET", "/data?key=secret")).json(), { ok: true });
  assert.deepEqual(log, ["GET /data", "GET /data"]);
});

test("שגיאות", async (t) => {
  const req = await start(t, (app) => {
    app.get("/boom", () => { throw new Error("פרטים פנימיים"); });
    app.get("/async-boom", async () => { await null; throw new Error("פרטים פנימיים"); });
    app.get("/teapot", () => { throw Object.assign(new Error("אני קומקום"), { status: 418 }); });
  });
  const errors = console.error;
  console.error = () => {};
  try {
    for (const p of ["/boom", "/async-boom"]) {
      const res = await req("GET", p);
      assert.equal(res.status, 500, p);
      assert.deepEqual(await res.json(), { error: "שגיאה פנימית" });
    }
    const res = await req("GET", "/teapot");
    assert.equal(res.status, 418);
    assert.deepEqual(await res.json(), { error: "אני קומקום" });
  } finally {
    console.error = errors;
  }
});
