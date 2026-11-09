import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { load, listen, api } from "../../tools/load.mjs";

const { httpMetrics } = await load(import.meta.url, "P24-E28.ts");

// registry מדומה: רושם כל קריאה
function fakeRegistry() {
  const made = {};
  const calls = { inc: [], observe: [] };
  return {
    made, calls,
    counter(opts) { made.counter = opts; return { inc: (labels, by = 1) => calls.inc.push({ labels, by }) }; },
    histogram(opts) { made.histogram = opts; return { observe: (labels, v) => calls.observe.push({ labels, v }) }; },
    metrics: () => "# fake\nup 1\n",
  };
}
async function start(t) {
  const reg = fakeRegistry();
  const clock = { t: 5000 };
  const { middleware, handler } = httpMetrics(reg, { now: () => clock.t });
  const app = express();
  app.use(middleware);
  app.get("/metrics", handler);
  const router = express.Router();
  router.get("/:id", (req, res) => { clock.t += 120; res.json({ id: req.params.id }); });
  router.post("/", (req, res) => res.status(201).json({}));
  app.use("/tasks", router);
  app.get("/boom", () => { throw new Error("x"); });
  app.use((err, req, res, next) => res.status(500).json({ error: "internal" }));
  const { base, close } = await listen(app);
  t.after(close);
  return { reg, call: api(base) };
}
const settle = () => new Promise((r) => setTimeout(r, 30));

test("רושם counter ו־histogram בשמות ובלייבלים הנכונים", async (t) => {
  const { reg } = await start(t);
  assert.equal(reg.made.counter?.name, "http_requests_total");
  assert.deepEqual(reg.made.counter?.labelNames, ["method", "route", "status"]);
  assert.equal(reg.made.histogram?.name, "http_request_duration_seconds");
  assert.deepEqual(reg.made.histogram?.labelNames, ["method", "route"]);
  assert.ok(Array.isArray(reg.made.histogram?.buckets) && reg.made.histogram.buckets.length >= 5, "buckets — לפחות 5");
});
test("route לפי התבנית (כולל baseUrl), status כמחרוזת, משך בשניות", async (t) => {
  const { reg, call } = await start(t);
  await call("GET", "/tasks/42?x=1");
  await settle();
  assert.deepEqual(reg.calls.inc, [{ labels: { method: "GET", route: "/tasks/:id", status: "200" }, by: 1 }]);
  assert.equal(reg.calls.observe.length, 1);
  assert.deepEqual(reg.calls.observe[0].labels, { method: "GET", route: "/tasks/:id" });
  assert.ok(Math.abs(reg.calls.observe[0].v - 0.12) < 1e-9, `120ms ← 0.12 שניות (התקבל ${reg.calls.observe[0].v})`);
});
test("status נמדד בסוף: 201, 404 (unmatched) ו־500", async (t) => {
  const { reg, call } = await start(t);
  await call("POST", "/tasks", {});
  await call("GET", "/nope/7");
  await call("GET", "/boom");
  await settle();
  const got = reg.calls.inc.map((c) => `${c.labels.method} ${c.labels.route} ${c.labels.status}`);
  assert.deepEqual(got, ["POST /tasks 201", "GET unmatched 404", "GET /boom 500"]);
});
test("GET /metrics: הטקסט של ה־registry, text/plain — ולא נמדד בעצמו", async (t) => {
  const { reg, call } = await start(t);
  const r = await call("GET", "/metrics");
  await settle();
  assert.equal(r.status, 200);
  assert.equal(r.body, "# fake\nup 1\n");
  assert.match(r.headers.get("content-type"), /^text\/plain/);
  assert.equal(reg.calls.inc.length, 0, "בקשות ל־/metrics לא נספרות");
});
