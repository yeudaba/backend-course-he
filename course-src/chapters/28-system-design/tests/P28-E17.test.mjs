import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { createShortener, memoryStore } = await load(import.meta.url, "P28-E17.ts");
function setup() {
  let t = 1_000_000;
  const codes = ["abc1234", "abc1234", "xyz9876", "qqq0000"];
  const store = memoryStore();
  const s = createShortener(store, { newCode: () => codes.shift(), now: () => t });
  return { s, store, tick: (ms) => (t += ms) };
}

test("create ← קוד; resolve ← 302 וסופר קליק", async () => {
  const { s, store } = setup();
  const link = await s.create({ url: "https://example.com/menu?x=1" });
  assert.equal(link.code, "abc1234");
  assert.deepEqual(await s.resolve("abc1234"), { status: 302, location: "https://example.com/menu?x=1" });
  await s.resolve("abc1234");
  assert.equal(store.links.get("abc1234").clicks, 2);
  assert.deepEqual(await s.resolve("nope"), { status: 404 });
});
test("קוד תפוס ← מנסה קוד אחר", async () => {
  const { s } = setup();
  await s.create({ url: "https://a.com" });
  const second = await s.create({ url: "https://b.com" });
  assert.equal(second.code, "xyz9876");
});
test("כתובות מסוכנות או שבורות ← שגיאה", async () => {
  const { s } = setup();
  for (const url of ["javascript:alert(1)", "data:text/html,hi", "not a url", "ftp://x.com/f"]) {
    await assert.rejects(s.create({ url }), undefined, url);
  }
});
test("alias: תקין, תפוס, שמור", async () => {
  const { s } = setup();
  assert.equal((await s.create({ url: "https://shop.example.com", alias: "coffee-sale" })).code, "coffee-sale");
  await assert.rejects(s.create({ url: "https://x.com", alias: "coffee-sale" }), /תפוס/);
  await assert.rejects(s.create({ url: "https://x.com", alias: "admin" }));
  await assert.rejects(s.create({ url: "https://x.com", alias: "a b" }));
  await assert.rejects(s.create({ url: "https://x.com", alias: "ab" }));
});
test("תפוגה ← 410, בלי לספור קליק", async () => {
  const { s, store, tick } = setup();
  await s.create({ url: "https://a.com", ttlSeconds: 60 });
  tick(59_999);
  assert.equal((await s.resolve("abc1234")).status, 302);
  tick(1);
  assert.deepEqual(await s.resolve("abc1234"), { status: 410 });
  assert.equal(store.links.get("abc1234").clicks, 1);
});
