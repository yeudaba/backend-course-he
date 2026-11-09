import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { kafkaSandbox } from "../../tools/mq.mjs";
import { loadP, listen } from "./_events.mjs";

// פרויקט 4, שלב 1: שירות הקליטה — HTTP ← Kafka
const { createIngestServer } = await loadP(import.meta.url, "src/ingest.ts");
const KEY = "acme-key-0123456789";
const OTHER = "globex-key-0123456789";
const apiKeys = { [KEY]: "acme", [OTHER]: "globex" };
const ev = (over = {}) => ({ eventId: randomUUID(), name: "page_view", userId: "u1", ts: new Date(Date.now() - 60_000).toISOString(), ...over });

async function setup(t, opts = {}) {
  const k = await kafkaSandbox(t, { partitions: 3 });
  const topic = await k.topic("events");
  const call = await listen(t, createIngestServer({ producer: k.producer(), topic, apiKeys, ...opts }));
  return { k, topic, call };
}

test("API key: בלי או שגוי ← 401; /health בלי key", async (t) => {
  const { call } = await setup(t);
  assert.equal((await call("POST", "/v1/events", { events: [ev()] })).status, 401);
  const bad = await call("POST", "/v1/events", { events: [ev()] }, { "x-api-key": "nope" });
  assert.equal(bad.status, 401);
  assert.equal(bad.body.error.code, "INVALID_API_KEY");
  assert.equal((await call("GET", "/health")).status, 200);
  assert.equal((await call("GET", "/nope")).status, 404);
});
test("batch תקין ← 202, והאירועים ב־Kafka: key = tenant:user, ערך עם tenant ו־receivedAt", async (t) => {
  const { k, topic, call } = await setup(t);
  const events = [ev({ userId: "u1" }), ev({ userId: "u2", name: "add_to_cart", props: { productId: 3 } }), ev({ userId: "u1", name: "purchase" })];
  const r = await call("POST", "/v1/events", { events }, { "x-api-key": KEY });
  assert.equal(r.status, 202, JSON.stringify(r.body));
  assert.deepEqual(r.body, { accepted: 3, rejected: [] });
  const got = await k.readAll(topic, 3);
  assert.equal(got.length, 3);
  for (const m of got) {
    const v = JSON.parse(m.value);
    const src = events.find((e) => e.eventId === v.eventId);
    assert.ok(src, "eventId נשמר");
    assert.equal(m.key, `acme:${src.userId}`);
    assert.equal(v.tenantId, "acme", "tenant מה־API key — לא מהגוף");
    assert.deepEqual([v.name, v.userId, v.ts], [src.name, src.userId, src.ts]);
    assert.ok(!Number.isNaN(Date.parse(v.receivedAt)));
  }
  const u1 = got.filter((m) => m.key === "acme:u1");
  assert.equal(new Set(u1.map((m) => m.partition)).size, 1, "כל האירועים של משתמש — באותו partition");
});
test("אירועים לא תקינים נדחים אחד־אחד; השאר מתקבלים", async (t) => {
  const { k, topic, call } = await setup(t);
  const events = [
    ev(),
    ev({ eventId: "not-a-uuid" }),
    ev({ name: "Page View!" }),
    ev({ ts: new Date(Date.now() + 3600_000).toISOString() }),
    ev({ ts: new Date(Date.now() - 8 * 24 * 3600_000).toISOString() }),
    ev({ props: { blob: "x".repeat(3000) } }),
    ev({ userId: "" }),
    ev({ name: "purchase" }),
  ];
  const r = await call("POST", "/v1/events", { events }, { "x-api-key": OTHER });
  assert.equal(r.status, 202);
  assert.equal(r.body.accepted, 2);
  assert.deepEqual(r.body.rejected.map((x) => x.index), [1, 2, 3, 4, 5, 6]);
  assert.ok(r.body.rejected.every((x) => typeof x.reason === "string" && x.reason.length > 0));
  const got = await k.readAll(topic, 2);
  assert.ok(got.every((m) => JSON.parse(m.value).tenantId === "globex"));
});
test("גוף לא תקין ← 400; גדול מ־1MB ← 413; יותר מ־maxBatch ← 400", async (t) => {
  const { call } = await setup(t, { maxBatch: 10 });
  const h = { "x-api-key": KEY };
  assert.equal((await call("POST", "/v1/events", "{oops", h)).status, 400);
  assert.equal((await call("POST", "/v1/events", { events: [] }, h)).status, 400);
  assert.equal((await call("POST", "/v1/events", { nope: 1 }, h)).status, 400);
  assert.equal((await call("POST", "/v1/events", { events: Array.from({ length: 11 }, () => ev()) }, h)).status, 400);
  assert.equal((await call("POST", "/v1/events", { events: [ev({ props: { a: "x".repeat(1_100_000) } })] }, h)).status, 413);
});
test("202 רק אחרי ש־Kafka אישר; Kafka לא זמין ← 503", async (t) => {
  let sent = 0;
  const slow = { send: async () => (await new Promise((r) => setTimeout(r, 200)), sent++, { offsets: [] }) };
  const call = await listen(t, createIngestServer({ producer: slow, topic: "x", apiKeys }));
  const t0 = Date.now();
  const r = await call("POST", "/v1/events", { events: [ev(), ev()] }, { "x-api-key": KEY });
  assert.equal(r.status, 202);
  assert.ok(Date.now() - t0 >= 190, "התשובה לפני האישור — אירוע 'התקבל' שאולי לא נשמר");
  assert.equal(sent, 1, "send אחד ל־batch — לא אחד לכל אירוע");
  const down = await listen(t, createIngestServer({ producer: { send: async () => { throw new Error("broker down"); } }, topic: "x", apiKeys }));
  assert.equal((await down("POST", "/v1/events", { events: [ev()] }, { "x-api-key": KEY })).status, 503);
});
