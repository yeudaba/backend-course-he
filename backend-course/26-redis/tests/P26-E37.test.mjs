import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { addToCart, getCart, clearCart } = await load(import.meta.url, "P26-E37.ts");

test("הוספה, הורדה ומחיקה ב־0", async (t) => {
  const { redis, raw, prefix } = await redisSandbox(t);
  assert.equal(await addToCart(redis, 7, 3, 2), 2);
  assert.equal(await addToCart(redis, 7, 3, 3), 5, "מצטבר");
  assert.equal(await addToCart(redis, 7, 8, 1), 1);
  assert.deepEqual(await getCart(redis, 7), { 3: 5, 8: 1 }, "כמויות כמספרים");
  assert.equal(await addToCart(redis, 7, 8, -4), 0, "ירד מתחת ל־0 ← 0");
  assert.equal(await raw.hexists(`${prefix}cart:7`, "8"), 0, "השדה נמחק מה־hash");
  assert.equal(await raw.type(`${prefix}cart:7`), "hash", "העגלה היא hash ב־cart:<userId>");
  assert.deepEqual(await getCart(redis, 9), {}, "עגלה ריקה");
});
test("תוקף של 7 ימים, ו־50 הוספות במקביל לא מאבדות יחידות", async (t) => {
  const { redis, raw, prefix } = await redisSandbox(t);
  await Promise.all(Array.from({ length: 50 }, () => addToCart(redis, 1, 5, 1)));
  assert.deepEqual(await getCart(redis, 1), { 5: 50 });
  const ttl = await raw.ttl(`${prefix}cart:1`);
  assert.ok(ttl > 6 * 86400 && ttl <= 7 * 86400, `ttl ${ttl}`);
});
test("clearCart", async (t) => {
  const { redis } = await redisSandbox(t);
  await addToCart(redis, 2, 1, 1);
  assert.equal(await clearCart(redis, 2), true);
  assert.equal(await clearCart(redis, 2), false);
  assert.deepEqual(await getCart(redis, 2), {});
});
