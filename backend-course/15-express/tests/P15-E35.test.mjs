import { test } from "node:test";
import assert from "node:assert/strict";
import { startApp, typesOk } from "./_app.mjs";

const FILE = "P15-E35.ts";
test("עובר בדיקת טיפוסים", () => typesOk(import.meta.url, FILE));
test("increment ו־GET", async (t) => {
  const call = await startApp(t, import.meta.url, FILE);
  assert.deepEqual((await call("GET", "/counters/visits")).body, { name: "visits", value: 0 }, "מונה שלא קיים ← 0");
  let r = await call("POST", "/counters/visits/increment");
  assert.deepEqual([r.status, r.body], [200, { name: "visits", value: 1 }], "בלי גוף ← by=1");
  r = await call("POST", "/counters/visits/increment", { by: 5 });
  assert.deepEqual(r.body, { name: "visits", value: 6 });
  r = await call("POST", "/counters/visits/increment", {});
  assert.deepEqual(r.body, { name: "visits", value: 7 });
  r = await call("POST", "/counters/other/increment", { by: 100 });
  assert.deepEqual(r.body, { name: "other", value: 100 });
  assert.deepEqual((await call("GET", "/counters/visits")).body, { name: "visits", value: 7 });
});
test("by לא תקין ← 400, המונה לא משתנה", async (t) => {
  const call = await startApp(t, import.meta.url, FILE);
  await call("POST", "/counters/c/increment", { by: 2 });
  for (const by of ["5", 0, 101, 1.5, -1, true]) {
    const r = await call("POST", "/counters/c/increment", { by });
    assert.equal(r.status, 400, `by: ${JSON.stringify(by)} ← 400`);
    assert.deepEqual(r.body, { error: "by חייב להיות מספר שלם 1–100" });
  }
  assert.deepEqual((await call("GET", "/counters/c")).body, { name: "c", value: 2 });
});
test("DELETE", async (t) => {
  const call = await startApp(t, import.meta.url, FILE);
  await call("POST", "/counters/c/increment");
  let r = await call("DELETE", "/counters/c");
  assert.equal(r.status, 204);
  assert.equal(r.body, undefined, "204 בלי גוף");
  r = await call("DELETE", "/counters/c");
  assert.deepEqual([r.status, r.body], [404, { error: "אין מונה כזה" }]);
  assert.deepEqual((await call("GET", "/counters/c")).body, { name: "c", value: 0 });
});
