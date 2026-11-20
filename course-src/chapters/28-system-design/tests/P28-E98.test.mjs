import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen, api } from "../../tools/load.mjs";

const { feedApp } = await load(import.meta.url, "P28-E98.ts");

async function start(t, threshold = 3) {
  let clock = 1000;
  const { base, close } = await listen(feedApp({ celebrityThreshold: threshold, now: () => clock }));
  t.after(close);
  return { call: api(base), tick: (ms) => { clock += ms; } };
}

test("fan-out לרגילים, משיכה לסלבריטאים", async (t) => {
  const { call, tick } = await start(t);
  for (const f of ["a", "b", "c", "d"]) assert.equal((await call("POST", "/follow", { follower: f, followee: "star" })).status, 204);
  await call("POST", "/follow", { follower: "a", followee: "dana" });
  await call("POST", "/follow", { follower: "b", followee: "dana" });
  let r = await call("POST", "/posts", { author: "dana", text: "שלום" });
  assert.equal(r.status, 201);
  assert.deepEqual(r.body, { id: 1, author: "dana", text: "שלום", at: 1000 });
  tick(10);
  await call("POST", "/posts", { author: "star", text: "הופעה" });
  tick(10);
  await call("POST", "/posts", { author: "dana", text: "שוב" });
  assert.deepEqual((await call("GET", "/stats")).body, { feedWrites: 4 }, "dana: 2 פוסטים × 2 עוקבים; star — סלבריטי");
  r = await call("GET", "/feed/a");
  assert.deepEqual(r.body.items.map((p) => p.id), [3, 2, 1]);
  assert.deepEqual(r.body.items[1], { id: 2, author: "star", text: "הופעה", at: 1010 });
  assert.deepEqual((await call("GET", "/feed/c")).body.items.map((p) => p.id), [2]);
  assert.deepEqual((await call("GET", "/feed/a?limit=1")).body.items.map((p) => p.id), [3]);
  assert.deepEqual((await call("GET", "/feed/zz")).body, { items: [] });
});
test("מי שהפך לסלבריטי — בלי כפילויות", async (t) => {
  const { call } = await start(t, 2);
  await call("POST", "/follow", { follower: "a", followee: "x" });
  await call("POST", "/posts", { author: "x", text: "1" });
  await call("POST", "/follow", { follower: "b", followee: "x" });
  await call("POST", "/posts", { author: "x", text: "2" });
  assert.deepEqual((await call("GET", "/feed/a")).body.items.map((p) => p.id), [2, 1]);
  assert.deepEqual((await call("GET", "/stats")).body, { feedWrites: 1 });
});
test("400", async (t) => {
  const { call } = await start(t);
  assert.equal((await call("POST", "/follow", { follower: "a", followee: "a" })).status, 400);
  assert.equal((await call("POST", "/follow", { follower: "a" })).status, 400);
  assert.equal((await call("POST", "/posts", { author: "a", text: "  " })).status, 400);
  assert.equal((await call("POST", "/posts", { text: "x" })).status, 400);
  assert.equal((await call("POST", "/posts", { author: 5, text: "x" })).status, 400, "author שאינו מחרוזת");
});
test("limit עד 100", async (t) => {
  const { call } = await start(t, 1000);
  await call("POST", "/follow", { follower: "r", followee: "w" });
  for (let i = 0; i < 120; i++) await call("POST", "/posts", { author: "w", text: `p${i}` });
  assert.equal((await call("GET", "/feed/r")).body.items.length, 20);
  assert.equal((await call("GET", "/feed/r?limit=500")).body.items.length, 100);
});
