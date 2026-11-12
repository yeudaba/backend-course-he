import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { createLiveApp } = await load(import.meta.url, "P26-E118.ts");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function server(t, sb, channel) {
  const pub = await sb.client();
  const sub = await sb.client();
  const live = await createLiveApp({ pub, sub, channel });
  const { base, close } = await listen(live.app);
  t.after(async () => { await close(); await live.close().catch(() => {}); });
  return { base, sub, live };
}
async function connect(base) {
  const ac = new AbortController();
  const res = await fetch(base + "/events", { signal: ac.signal });
  const s = { res, text: "", close: () => ac.abort() };
  (async () => {
    const dec = new TextDecoder();
    try { for await (const c of res.body) s.text += dec.decode(c, { stream: true }); } catch { /* נסגר */ }
  })();
  return s;
}
const datas = (text) => [...text.matchAll(/^data: (.*)$/gm)].map((m) => JSON.parse(m[1]));

test("POST ל־A מגיע ללקוחות של A ושל B — פעם אחת לכל אחד", async (t) => {
  const sb = await redisSandbox(t);
  const channel = `${sb.prefix}live`;
  const A = await server(t, sb, channel);
  const B = await server(t, sb, channel);
  const onA = await connect(A.base);
  const onB1 = await connect(B.base);
  const onB2 = await connect(B.base);
  t.after(() => { onA.close(); onB1.close(); onB2.close(); });
  assert.equal(onB1.res.status, 200);
  assert.match(onB1.res.headers.get("content-type"), /^text\/event-stream/);
  await sleep(50);
  const r = await fetch(A.base + "/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: 7, status: "shipped" }) });
  assert.equal(r.status, 202);
  await fetch(B.base + "/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ n: 2 }) });
  await sleep(150);
  for (const [name, s] of [["A", onA], ["B1", onB1], ["B2", onB2]]) {
    assert.deepEqual(datas(s.text), [{ orderId: 7, status: "shipped" }, { n: 2 }], `לקוח ${name}: ${JSON.stringify(s.text)}`);
  }
});
test("מנוי אחד לאפליקציה; ערוץ אחר לא נכנס; close מבטל", async (t) => {
  const sb = await redisSandbox(t);
  const channel = `${sb.prefix}live2`;
  const A = await server(t, sb, channel);
  const c1 = await connect(A.base);
  const c2 = await connect(A.base);
  t.after(() => { c1.close(); c2.close(); });
  await sleep(50);
  const [, subs] = await sb.raw.pubsub("NUMSUB", channel);
  assert.equal(subs, 1, `${subs} מנויים לערוץ — צריך אחד לאפליקציה, לא לכל לקוח`);
  await A.sub.subscribe(`${channel}:other`);
  await sb.raw.publish(`${channel}:other`, JSON.stringify({ wrong: true }));
  await sb.raw.publish(channel, JSON.stringify({ ok: 1 }));
  await sleep(100);
  assert.deepEqual(datas(c1.text), [{ ok: 1 }]);
  await A.live.close();
  const [, after] = await sb.raw.pubsub("NUMSUB", channel);
  assert.equal(after, 0, "close() מבטל את המנוי");
});
