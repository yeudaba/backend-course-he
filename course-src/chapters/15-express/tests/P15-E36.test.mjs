import { test } from "node:test";
import assert from "node:assert/strict";
import { startApp, typesOk } from "./_app.mjs";

const FILE = "P15-E36.ts";
test("עובר בדיקת טיפוסים", () => typesOk(import.meta.url, FILE));
test("יצירה, כפילות והפניה", async (t) => {
  const call = await startApp(t, import.meta.url, FILE);
  let r = await call("POST", "/links", { url: "https://example.com/a?b=1" });
  assert.deepEqual([r.status, r.body], [201, { code: "1", url: "https://example.com/a?b=1" }]);
  assert.equal(r.headers.get("location"), "/links/1");
  r = await call("POST", "/links", { url: "http://shop.test/" });
  assert.deepEqual([r.status, r.body], [201, { code: "2", url: "http://shop.test/" }]);
  r = await call("POST", "/links", { url: "https://example.com/a?b=1" });
  assert.deepEqual([r.status, r.body], [200, { code: "1", url: "https://example.com/a?b=1" }], "אותה כתובת ← אותו code, 200");
  r = await call("POST", "/links", { url: "https://other.test" });
  assert.equal(r.body.code, "3", "כפילות לא צורכת מספר");
  const go = await fetch(call.base + "/links/2", { redirect: "manual" });
  assert.equal(go.status, 302);
  assert.equal(go.headers.get("location"), "http://shop.test/");
  assert.equal(await go.text(), "", "302 בלי גוף");
});
test("כתובות לא תקינות", async (t) => {
  const call = await startApp(t, import.meta.url, FILE);
  for (const url of ["javascript:alert(1)", "ftp://x.test/a", "example.com", "https://", 42, undefined]) {
    const r = await call("POST", "/links", { url });
    assert.deepEqual([r.status, r.body], [400, { error: "כתובת לא תקינה" }], `url: ${JSON.stringify(url)}`);
  }
  assert.equal((await call("POST", "/links")).status, 400, "בלי גוף ← 400");
});
test("קוד לא קיים", async (t) => {
  const call = await startApp(t, import.meta.url, FILE);
  const r = await call("GET", "/links/9");
  assert.deepEqual([r.status, r.body], [404, { error: "קישור לא קיים" }]);
});
