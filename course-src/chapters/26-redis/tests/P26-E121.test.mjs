import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { addPoints, top, rankOf } = await load(import.meta.url, "P26-E121.ts");

async function fill(redis) {
  for (const [u, p] of [["dana", 10], ["yossi", 7], ["noa", 3], ["dana", 5], ["avi", 12], ["noa", 1]]) await addPoints(redis, "w1", u, p);
}

test("addPoints מוסיפה", async (t) => {
  const { redis } = await redisSandbox(t);
  assert.equal(await addPoints(redis, "w1", "dana", 10), 10);
  assert.equal(await addPoints(redis, "w1", "dana", 5), 15, "המשחק השני צריך להוסיף, לא לדרוס");
  assert.equal(await addPoints(redis, "w1", "dana", -2), 13);
  assert.equal(await addPoints(redis, "w2", "dana", 1), 1, "לוח אחר — נפרד");
});
test("top: n הגבוהים, מהגבוה לנמוך", async (t) => {
  const { redis } = await redisSandbox(t);
  await fill(redis);
  assert.deepEqual(await top(redis, "w1", 3), [{ user: "dana", score: 15 }, { user: "avi", score: 12 }, { user: "yossi", score: 7 }]);
  assert.equal((await top(redis, "w1", 1)).length, 1);
  assert.deepEqual(await top(redis, "w1", 10), [{ user: "dana", score: 15 }, { user: "avi", score: 12 }, { user: "yossi", score: 7 }, { user: "noa", score: 4 }]);
  assert.deepEqual(await top(redis, "empty", 3), []);
});
test("rankOf מ־1", async (t) => {
  const { redis } = await redisSandbox(t);
  await fill(redis);
  assert.equal(await rankOf(redis, "w1", "dana"), 1, "המקום הראשון הוא 1");
  assert.equal(await rankOf(redis, "w1", "noa"), 4);
  assert.equal(await rankOf(redis, "w1", "nobody"), null);
});
