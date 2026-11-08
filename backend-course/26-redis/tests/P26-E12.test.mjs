import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { acquire, release, withLock } = await load(import.meta.url, "P26-E12.ts");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test("רק אחד מקבל, ורק הבעלים משחרר", async (t) => {
  const sb = await redisSandbox(t);
  const other = await sb.client();
  const a = await acquire(sb.redis, "report", 5000);
  assert.equal(typeof a, "string");
  assert.equal(await acquire(other, "report", 5000), null, "שרת אחר — לא מקבל");
  assert.equal(await release(other, "report", "not-my-token"), false, "לא הבעלים — לא משחרר");
  assert.equal(await sb.redis.exists("lock:report"), 1);
  assert.equal(await release(sb.redis, "report", a), true);
  assert.equal(typeof (await acquire(other, "report", 5000)), "string", "אחרי שחרור — פנוי");
});
test("תוקף: תהליך שמת לא נועל לנצח", async (t) => {
  const { redis } = await redisSandbox(t);
  const a = await acquire(redis, "job", 200);
  const pttl = await redis.pttl("lock:job");
  assert.ok(pttl > 0 && pttl <= 200, "PX — עם תוקף, באותה פקודה");
  await sleep(300);
  const b = await acquire(redis, "job", 200);
  assert.ok(b && b !== a);
  assert.equal(await release(redis, "job", a), false, "הטוקן הישן לא משחרר מנעול של מישהו אחר");
});
test("withLock — 10 במקביל, אחד רץ", async (t) => {
  const sb = await redisSandbox(t);
  const clients = [sb.redis, await sb.client(), await sb.client()];
  let running = 0;
  let ran = 0;
  const results = await Promise.all(Array.from({ length: 10 }, (_, i) => withLock(clients[i % 3], "nightly", 5000, async () => {
    running++;
    ran++;
    assert.equal(running, 1, "אף פעם שניים בבת אחת");
    await sleep(50);
    running--;
    return "done";
  })));
  assert.equal(ran, 1);
  assert.deepEqual(results.filter(Boolean), ["done"]);
  assert.equal(await sb.redis.exists("lock:nightly"), 0, "משוחרר בסוף");
  await assert.rejects(withLock(sb.redis, "x", 5000, async () => { throw new Error("boom"); }), { message: "boom" });
  assert.equal(await sb.redis.exists("lock:x"), 0, "משוחרר גם כשנזרקה שגיאה");
});
