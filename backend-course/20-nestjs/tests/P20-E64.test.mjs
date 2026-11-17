import { test } from "node:test";
import assert from "node:assert/strict";
import { nestApp } from "../../tools/nest.mjs";
import { exportsOf } from "./_nest.mjs";

const get = () => exportsOf(import.meta.url, "P20-E64.ts", ["PaymentsModule", "IdempotencyInterceptor", "PaymentsController", "IDEMPOTENCY_STORE"]);
test("אותו מפתח — אותה תשובה, תשלום אחד", async (t) => {
  const { PaymentsModule } = get();
  const { call } = await nestApp(t, PaymentsModule);
  const k = { headers: { "Idempotency-Key": "k-1" } };
  const a = await call("POST", "/payments", { amount: 100 }, k);
  assert.equal(a.status, 201);
  assert.deepEqual(a.body, { id: 1, amount: 100 });
  assert.equal(a.headers.get("idempotent-replayed"), null);
  const b = await call("POST", "/payments", { amount: 100 }, k);
  assert.equal(b.status, 201);
  assert.deepEqual(b.body, { id: 1, amount: 100 }, "אותה תשובה");
  assert.equal(b.headers.get("idempotent-replayed"), "true");
  assert.deepEqual((await call("GET", "/payments/count")).body, { count: 1 }, "ה־handler לא רץ שוב");
  assert.deepEqual((await call("POST", "/payments", { amount: 5 }, { headers: { "Idempotency-Key": "k-2" } })).body, { id: 2, amount: 5 });
  assert.deepEqual((await call("POST", "/payments", { amount: 7 })).body, { id: 3, amount: 7 }, "בלי מפתח — רגיל");
  assert.deepEqual((await call("POST", "/payments", { amount: 7 })).body, { id: 4, amount: 7 });
  assert.deepEqual((await call("GET", "/payments/count")).body, { count: 4 });
});
test("מטמון נפרד לכל אפליקציה, והבודק יכול להחליף אותו", async (t) => {
  const { PaymentsModule, IDEMPOTENCY_STORE } = get();
  const a = await nestApp(t, PaymentsModule);
  await a.call("POST", "/payments", { amount: 1 }, { headers: { "Idempotency-Key": "shared" } });
  const b = await nestApp(t, PaymentsModule);
  const r = await b.call("POST", "/payments", { amount: 2 }, { headers: { "Idempotency-Key": "shared" } });
  assert.equal(r.headers.get("idempotent-replayed"), null, "מפתח מאפליקציה אחרת לא אמור להיות במטמון (useFactory, לא useValue)");
  assert.deepEqual(r.body, { id: 1, amount: 2 });
  const store = new Map([["pre", { id: 99, amount: 0 }]]);
  const c = await nestApp(t, PaymentsModule, { overrides: [[IDEMPOTENCY_STORE, store]] });
  assert.deepEqual((await c.call("POST", "/payments", { amount: 3 }, { headers: { "Idempotency-Key": "pre" } })).body, { id: 99, amount: 0 }, "המטמון מגיע מה־token");
  await c.call("POST", "/payments", { amount: 3 }, { headers: { "Idempotency-Key": "new" } });
  assert.ok(store.has("new"));
});
