import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { leaderboard } = await load(import.meta.url, "P26-E10.ts");

test("add, top, rank, around", async (t) => {
  const { redis } = await redisSandbox(t);
  const lb = leaderboard(redis, "nov");
  for (const [p, s] of [["dana", 50], ["yossi", 30], ["noa", 70], ["avi", 10], ["tal", 40]]) await lb.add(p, s);
  assert.equal(await lb.add("yossi", 25), 55, "מצטבר — מחזיר את הניקוד החדש");
  assert.deepEqual(await lb.top(3), [{ player: "noa", score: 70, rank: 1 }, { player: "yossi", score: 55, rank: 2 }, { player: "dana", score: 50, rank: 3 }]);
  assert.equal(await lb.rank("noa"), 1);
  assert.equal(await lb.rank("avi"), 5);
  assert.equal(await lb.rank("ghost"), null);
  assert.deepEqual((await lb.around("dana", 1)).map((x) => x.player), ["yossi", "dana", "tal"]);
  assert.deepEqual((await lb.around("noa", 1)).map((x) => [x.player, x.rank]), [["noa", 1], ["yossi", 2]]);
  assert.deepEqual(await lb.around("ghost", 1), []);
  assert.deepEqual(await leaderboard(redis, "dec").top(3), [], "טבלה אחרת");
});
