import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen } from "../../tools/load.mjs";

const { ordersApp } = await load(import.meta.url, "P26.5-E44.ts");

async function start(t, publish) {
  const published = [];
  let n = 0;
  const app = ordersApp({ publish: async (e) => { await publish(e); published.push(e); }, newId: () => `ord-${++n}` });
  const { base, close } = await listen(app);
  t.after(close);
  const post = (body) => fetch(base + "/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return { post, published };
}
const body = { email: "dana@example.com", items: [{ productId: 7, qty: 2 }] };

test("תקין ← 202 ואירוע אחד", async (t) => {
  const { post, published } = await start(t, async () => {});
  const r = await post(body);
  assert.equal(r.status, 202);
  assert.deepEqual(await r.json(), { orderId: "ord-1" });
  assert.deepEqual(published, [{ id: "ord-1", type: "order.placed", data: body }]);
});
test("לא תקין ← 400 בלי אירוע; publish נכשל ← 503", async (t) => {
  const { post, published } = await start(t, async () => {});
  for (const b of [{ ...body, email: "nope" }, { ...body, items: [] }, { ...body, items: [{ productId: 0, qty: 1 }] }, { email: "a@b" }]) {
    const r = await post(b);
    assert.equal(r.status, 400, JSON.stringify(b));
    assert.ok((await r.json()).error);
  }
  assert.equal(published.length, 0);
  const down = await start(t, async () => { throw new Error("broker down"); });
  const r = await down.post(body);
  assert.equal(r.status, 503);
  assert.ok((await r.json()).error);
});
