import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P14-E35.mjs", ["sameOrigin"])).sameOrigin;

test("אותו origin", async () => {
  const f = await get();
  for (const [a, b] of [
    ["http://localhost:3000/a", "http://localhost:3000/b?x=1"],
    ["http://example.com", "http://example.com:80/x"],
    ["https://EXAMPLE.com/", "https://example.com:443"],
    ["https://api.shop.co.il:8443/v1", "https://api.shop.co.il:8443/v2?q=1"],
  ]) {
    assert.equal(f(a, b), true, `${a} ו־${b} — אותו origin`);
  }
});
test("origin שונה", async () => {
  const f = await get();
  for (const [a, b] of [
    ["https://example.com", "http://example.com"],
    ["http://localhost:3000", "http://127.0.0.1:3000"],
    ["http://localhost:3000", "http://localhost:3001"],
    ["https://example.com", "https://example.com:8443"],
    ["https://shop.co.il", "https://api.shop.co.il"],
    ["http://example.com:443", "https://example.com"],
  ]) {
    assert.equal(f(a, b), false, `${a} ו־${b} — origins שונים`);
  }
});
test("כתובת לא תקינה ← false", async () => {
  const f = await get();
  assert.equal(f("not a url", "http://x.com"), false);
  assert.equal(f("http://x.com", "/relative"), false);
});
