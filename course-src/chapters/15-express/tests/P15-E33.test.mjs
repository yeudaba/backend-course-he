import { test } from "node:test";
import assert from "node:assert/strict";
import { startApp, typesOk } from "./_app.mjs";

const FILE = "P15-E33.ts";
test("עובר בדיקת טיפוסים", () => typesOk(import.meta.url, FILE));
test("יצירה ← 201, החלפה ← 200", async (t) => {
  const call = await startApp(t, import.meta.url, FILE);
  let r = await call("PUT", "/settings/theme", { value: "dark" });
  assert.equal(r.status, 201, "מפתח חדש ← 201");
  assert.equal(r.headers.get("location"), "/settings/theme");
  assert.deepEqual(r.body, { key: "theme", value: "dark" });
  r = await call("PUT", "/settings/theme", { value: "light" });
  assert.equal(r.status, 200, "מפתח קיים ← 200");
  assert.equal(r.headers.get("location"), null, "בהחלפה אין Location");
  assert.deepEqual(r.body, { key: "theme", value: "light" });
  r = await call("GET", "/settings/theme");
  assert.deepEqual([r.status, r.body], [200, { key: "theme", value: "light" }]);
});
test("ערכים falsy הם ערכים", async (t) => {
  const call = await startApp(t, import.meta.url, FILE);
  for (const [key, value] of [["a", false], ["b", 0], ["c", ""], ["d", null], ["e", { x: [1] }]]) {
    const r = await call("PUT", `/settings/${key}`, { value });
    assert.equal(r.status, 201, `value: ${JSON.stringify(value)} תקין`);
  }
  const all = await call("GET", "/settings");
  assert.deepEqual(all.body, { a: false, b: 0, c: "", d: null, e: { x: [1] } });
});
test("שגיאות", async (t) => {
  const call = await startApp(t, import.meta.url, FILE);
  let r = await call("PUT", "/settings/x", {});
  assert.deepEqual([r.status, r.body], [400, { error: "חסר value" }]);
  r = await call("PUT", "/settings/x");
  assert.equal(r.status, 400, "בלי גוף בכלל ← 400 (לא 500)");
  r = await call("GET", "/settings/x");
  assert.deepEqual([r.status, r.body], [404, { error: "אין הגדרה כזו" }]);
  assert.deepEqual((await call("GET", "/settings")).body, {});
});
test("כל אפליקציה עם הגדרות משלה", async (t) => {
  const a = await startApp(t, import.meta.url, FILE);
  const b = await startApp(t, import.meta.url, FILE);
  await a("PUT", "/settings/k", { value: 1 });
  assert.equal((await b("GET", "/settings/k")).status, 404, "צור את ה־Map בתוך createApp");
});
