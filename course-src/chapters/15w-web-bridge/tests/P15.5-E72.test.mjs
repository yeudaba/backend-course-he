import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P15.5-E72.mjs", ["parseCorsOrigins"])).parseCorsOrigins;
test("ברירת מחדל", async () => {
  const f = await get();
  assert.deepEqual(f(undefined), ["http://localhost:5500"]);
  assert.deepEqual(f("   "), ["http://localhost:5500"]);
  const fb = ["https://a.test"];
  const r = f("", fb);
  assert.deepEqual(r, fb);
  assert.notEqual(r, fb, "עותק — לא אותו מערך");
});
test("פירוק ונרמול", async () => {
  const f = await get();
  assert.deepEqual(f("https://app.example.com, https://admin.example.com/,,https://APP.example.com"), ["https://app.example.com", "https://admin.example.com"]);
  assert.deepEqual(f("http://localhost:5500,http://127.0.0.1:5500"), ["http://localhost:5500", "http://127.0.0.1:5500"]);
  assert.deepEqual(f(" https://x.test:8443 "), ["https://x.test:8443"]);
  assert.deepEqual(f("https://x.test:443"), ["https://x.test"], "פורט ברירת מחדל יורד");
});
test("לא תקין", async () => {
  const f = await get();
  assert.throws(() => f("app.example.com, https://ok.test, https://x.test/admin"), { message: "CORS_ORIGINS לא תקין: app.example.com, https://x.test/admin" });
  assert.throws(() => f("ftp://x.test"), { message: "CORS_ORIGINS לא תקין: ftp://x.test" });
  assert.throws(() => f("https://x.test?a=1"), { message: "CORS_ORIGINS לא תקין: https://x.test?a=1" });
  assert.throws(() => f("https://x.test#top"), { message: "CORS_ORIGINS לא תקין: https://x.test#top" });
  assert.throws(() => f("*"), { message: "CORS_ORIGINS=* אסור — כתוב רשימה מפורשת" });
  assert.throws(() => f(" * "), { message: "CORS_ORIGINS=* אסור — כתוב רשימה מפורשת" });
});
