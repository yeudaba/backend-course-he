import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { sandbox } from "../../tools/sql.mjs";
import { sleep } from "../../tools/mq.mjs";

const { placeOrder, relayOutbox } = await load(import.meta.url, "P26.5-E23.ts");

test("באג 1: הזמנה שנכשלה לא משאירה אירוע ב־outbox", async (t) => {
  const db = await sandbox(t, import.meta.url, "events.sql");
  const pool = db.pool(3);
  await assert.rejects(placeOrder(pool, { email: "x@example.com", totalCents: -5 }));
  assert.equal((await db.rows("SELECT count(*)::int AS n FROM outbox"))[0].n, 0, "אירוע order.placed להזמנה שלא קיימת");
  const id = await placeOrder(pool, { email: "ok@example.com", totalCents: 500 });
  assert.equal((await db.rows("SELECT key FROM outbox"))[0].key, String(id));
});
test("באג 2: publish שנכשל ← השורה עדיין ממתינה", async (t) => {
  const db = await sandbox(t, import.meta.url, "events.sql");
  const pool = db.pool(3);
  await placeOrder(pool, { email: "a@example.com", totalCents: 100 });
  await assert.rejects(relayOutbox(pool, async () => {
    throw new Error("broker down");
  }));
  assert.equal((await db.rows("SELECT count(*)::int AS n FROM outbox WHERE published_at IS NULL"))[0].n, 1, "סומנה כנשלחה — והאירוע אבד");
});
test("באג 3: שני relays במקביל לא שולחים אותה שורה פעמיים", async (t) => {
  const db = await sandbox(t, import.meta.url, "events.sql");
  const pool = db.pool(6);
  for (let i = 1; i <= 6; i++) await placeOrder(pool, { email: `c${i}@example.com`, totalCents: 100 });
  const sent = [];
  const publish = async (r) => {
    await sleep(25);
    sent.push(Number(r.id));
  };
  await Promise.all([relayOutbox(pool, publish), relayOutbox(pool, publish)]);
  assert.equal(sent.length, 6, `נשלחו ${sent.length} במקום 6: ${sent.sort((a, b) => a - b)}`);
});
