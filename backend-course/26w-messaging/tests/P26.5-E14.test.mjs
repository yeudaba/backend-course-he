import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { kafkaSandbox, deadline } from "../../tools/mq.mjs";

const { consumeAndCommit } = await load(import.meta.url, "P26.5-E14.ts");

async function setup(t) {
  const k = await kafkaSandbox(t, { partitions: 1 });
  const topic = await k.topic("orders", 1);
  await k.producer().send({ messages: [1, 2, 3, 4, 5].map((i) => ({ topic, key: `o${i}`, value: JSON.stringify({ n: i }) })) });
  return { k, topic, opts: { brokers: k.brokers, groupId: k.groupId(), topic } };
}

test("group חדש קורא מההתחלה, ו־commit אחרי כל הודעה", async (t) => {
  const { k, topic, opts } = await setup(t);
  const seen = [];
  assert.equal(await deadline(consumeAndCommit(opts, async (e) => void seen.push(e.n), { max: 3 }), 8000, "consumeAndCommit לא חזר — מחכה להודעות שלא מגיעות?"), 3);
  assert.deepEqual(seen, [1, 2, 3]);
  assert.deepEqual(await k.committed(opts.groupId, topic), { 0: 3 }, "committed = ה־offset הבא לקריאה");
});
test("ריצה שנייה ממשיכה מאיפה שעצרנו", async (t) => {
  const { opts } = await setup(t);
  await deadline(consumeAndCommit(opts, async () => {}, { max: 2 }), 8000, "consumeAndCommit לא חזר — מחכה להודעות שלא מגיעות?");
  const seen = [];
  await deadline(consumeAndCommit(opts, async (e) => void seen.push(e.n), { max: 3 }), 8000, "consumeAndCommit לא חזר — מחכה להודעות שלא מגיעות?");
  assert.deepEqual(seen, [3, 4, 5]);
});
test("handler נכשל ← בלי commit, והשגיאה עולה; בריצה הבאה ההודעה מגיעה שוב", async (t) => {
  const { k, topic, opts } = await setup(t);
  const seen = [];
  await assert.rejects(
    consumeAndCommit(opts, async (e) => {
      seen.push(e.n);
      if (e.n === 3) throw new Error("db down");
    }, { max: 5 }),
    /db down/,
  );
  assert.deepEqual(await k.committed(opts.groupId, topic), { 0: 2 });
  const again = [];
  await deadline(consumeAndCommit(opts, async (e) => void again.push(e.n), { max: 3 }), 8000, "consumeAndCommit לא חזר — מחכה להודעות שלא מגיעות?");
  assert.deepEqual(again, [3, 4, 5], "3 לא אבד");
});
