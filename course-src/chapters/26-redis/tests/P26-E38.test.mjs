import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { vote, results } = await load(import.meta.url, "P26-E38.ts");

test("הצבעה אחת למשתמש, ותוצאות ממוינות", async (t) => {
  const { redis, raw, prefix } = await redisSandbox(t);
  assert.deepEqual(await results(redis, "p1"), []);
  assert.equal(await vote(redis, "p1", 1, "latte"), true);
  assert.equal(await vote(redis, "p1", 1, "mocha"), false, "כבר הצביע — גם לאפשרות אחרת");
  assert.equal(await vote(redis, "p1", 2, "mocha"), true);
  assert.equal(await vote(redis, "p1", 3, "espresso"), true);
  assert.equal(await vote(redis, "p1", 4, "mocha"), true);
  assert.equal(await vote(redis, "p2", 1, "x"), true, "סקר אחר — נפרד");
  assert.deepEqual(await results(redis, "p1"), [
    { option: "mocha", votes: 2 },
    { option: "espresso", votes: 1 },
    { option: "latte", votes: 1 },
  ], "מהגבוה לנמוך, בשוויון לפי א״ב");
  assert.equal(await raw.type(`${prefix}poll:p1:voters`), "set");
  assert.equal(await raw.type(`${prefix}poll:p1:results`), "hash");
});
test("20 קריאות במקביל משני שרתים — נספרת אחת", async (t) => {
  const sb = await redisSandbox(t);
  const second = await sb.client();
  const r = await Promise.all(Array.from({ length: 20 }, (_, i) => vote(i % 2 ? second : sb.redis, "race", 9, i % 3 ? "a" : "b")));
  assert.equal(r.filter(Boolean).length, 1, `נספרו ${r.filter(Boolean).length}`);
  const total = (await results(sb.redis, "race")).reduce((s, x) => s + x.votes, 0);
  assert.equal(total, 1);
});
