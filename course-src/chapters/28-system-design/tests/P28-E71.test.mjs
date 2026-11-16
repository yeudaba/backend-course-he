import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { createBlocklist } = await load(import.meta.url, "P28-E71.ts");

test("מתחם ותתי־מתחמים", () => {
  const blocked = createBlocklist(["evil.com", " Phish.Example.NET. "]);
  assert.equal(blocked("https://evil.com/login"), true);
  assert.equal(blocked("https://a.b.evil.com/"), true);
  assert.equal(blocked("http://EVIL.com"), true);
  assert.equal(blocked("https://notevil.com/"), false);
  assert.equal(blocked("https://evil.com.example.org/"), false);
  assert.equal(blocked("https://ok.com/?ref=evil.com"), false);
  assert.equal(blocked("https://login.phish.example.net/x"), true);
  assert.equal(blocked("https://example.net/"), false);
  assert.equal(blocked("https://evil.com./"), true);
});
test("URL לא תקין ← חסום", () => {
  const blocked = createBlocklist([]);
  assert.equal(blocked("not a url"), true);
  assert.equal(blocked("https://fine.org"), false);
});
test("מהיר — Set ולא מעבר על הרשימה", () => {
  const list = Array.from({ length: 200_000 }, (_, i) => `bad${i}.example`);
  const blocked = createBlocklist(list);
  const t0 = performance.now();
  let n = 0;
  for (let i = 0; i < 20_000; i++) if (blocked(`https://www.site${i}.org/p`)) n++;
  assert.equal(n, 0);
  assert.equal(blocked("https://x.bad199999.example"), true);
  assert.ok(performance.now() - t0 < 1500, "20,000 בדיקות מול 200,000 מתחמים — צריך Set");
});
