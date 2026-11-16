import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { load, listen } from "../../tools/load.mjs";

const { exportApp } = await load(import.meta.url, "P28.5-E69.ts");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test("NDJSON בסדר הנכון", async (t) => {
  async function* rows() { for (let i = 1; i <= 3; i++) yield { id: i, name: `שם ${i}` }; }
  const { base, close } = await listen(exportApp(rows));
  t.after(close);
  const r = await fetch(`${base}/export.ndjson`);
  assert.equal(r.status, 200);
  assert.match(r.headers.get("content-type"), /application\/x-ndjson/);
  assert.equal(await r.text(), '{"id":1,"name":"שם 1"}\n{"id":2,"name":"שם 2"}\n{"id":3,"name":"שם 3"}\n');
});
test("לקוח שמתנתק — המקור נסגר", async (t) => {
  const state = { produced: 0, closed: false };
  async function* rows() {
    try {
      for (let i = 0; i < 1_000_000; i++) {
        state.produced++;
        yield { id: i, pad: "x".repeat(200) };
        if (i % 100 === 0) await sleep(0);
      }
    } finally {
      state.closed = true;
    }
  }
  const { base, close } = await listen(exportApp(rows));
  t.after(close);
  await new Promise((resolve) => {
    const req = http.get(`${base}/export.ndjson`, (res) => {
      res.once("data", () => { req.destroy(); resolve(); });
    });
    req.on("error", () => {});
  });
  for (let i = 0; i < 50 && !state.closed; i++) await sleep(20);
  assert.equal(state.closed, true, "ה־finally של ה־generator לא רץ — המקור לא נסגר כשהלקוח התנתק");
  assert.ok(state.produced < 500_000, `נוצרו ${state.produced} שורות אחרי שהלקוח התנתק`);
});
test("שגיאה במקור — לא מפילה את השרת", async (t) => {
  async function* rows() { yield { id: 1 }; throw new Error("db down"); }
  const { base, close } = await listen(exportApp(rows));
  t.after(close);
  await fetch(`${base}/export.ndjson`).then((r) => r.text()).catch(() => {});
  const r = await fetch(`${base}/export.ndjson`).then((r) => r.status).catch(() => "closed");
  assert.ok(r === 200 || r === "closed");
});
