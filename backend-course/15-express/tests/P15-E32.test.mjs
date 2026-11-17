import { test } from "node:test";
import assert from "node:assert/strict";
import { startApp, typesOk } from "./_app.mjs";

const FILE = "P15-E32.ts";
test("עובר בדיקת טיפוסים", () => typesOk(import.meta.url, FILE));
test("עברית ואנגלית", async (t) => {
  const call = await startApp(t, import.meta.url, FILE);
  for (const [path, greeting] of [["/greet/" + encodeURIComponent("דנה"), "שלום דנה"], ["/greet/Yossi?lang=he", "שלום Yossi"], ["/greet/Dana?lang=en", "Hello Dana"], ["/greet/a%20b?lang=en", "Hello a b"]]) {
    const r = await call("GET", path);
    assert.equal(r.status, 200, path);
    assert.deepEqual(r.body, { greeting }, path);
  }
});
test("שפה לא נתמכת", async (t) => {
  const call = await startApp(t, import.meta.url, FILE);
  for (const path of ["/greet/x?lang=fr", "/greet/x?lang=", "/greet/x?lang=EN", "/greet/x?lang=en&lang=he"]) {
    const r = await call("GET", path);
    assert.equal(r.status, 400, `${path} ← 400`);
    assert.deepEqual(r.body, { error: "שפה לא נתמכת" });
  }
});
