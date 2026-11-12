import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { kafkaSandbox } from "../../tools/mq.mjs";

const { rewindGroup } = await load(import.meta.url, "P26.5-E83.ts");

test("קובע committed offsets ל־group", async (t) => {
  const k = await kafkaSandbox(t, { partitions: 3 });
  const topic = await k.topic("orders", 3);
  await k.producer().send({ messages: Array.from({ length: 30 }, (_, i) => ({ topic, key: `k${i}`, value: String(i), partition: i % 3 })) });
  const groupId = k.groupId();
  await rewindGroup(k.admin, groupId, topic, { 0: 5, 2: 1 });
  assert.deepEqual(await k.committed(groupId, topic), { 0: 5, 2: 1 });
  await rewindGroup(k.admin, groupId, topic, { 0: 0 });
  assert.equal((await k.committed(groupId, topic))[0], 0);
});
test("ערך לא תקין ← RangeError בלי שינוי; ריק ← כלום", async (t) => {
  const k = await kafkaSandbox(t, { partitions: 1 });
  const topic = await k.topic("o", 1);
  await k.producer().send({ messages: [{ topic, key: "a", value: "1" }, { topic, key: "a", value: "2" }] });
  const groupId = k.groupId();
  await rewindGroup(k.admin, groupId, topic, { 0: 2 });
  for (const bad of [{ 0: -1 }, { 0: 1.5 }, { "-1": 0 }]) await assert.rejects(rewindGroup(k.admin, groupId, topic, bad), RangeError, JSON.stringify(bad));
  await rewindGroup(k.admin, groupId, topic, {});
  assert.deepEqual(await k.committed(groupId, topic), { 0: 2 });
});
