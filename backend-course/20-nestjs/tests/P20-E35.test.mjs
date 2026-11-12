import { test } from "node:test";
import assert from "node:assert/strict";
import { nestApp } from "../../tools/nest.mjs";
import { exportsOf } from "./_nest.mjs";

test("ברכות ושפות", async (t) => {
  const { GreetingsModule, GreetingsService, HelloController, LanguagesController } = exportsOf(import.meta.url, "P20-E35.ts", ["GreetingsModule", "GreetingsService", "HelloController", "LanguagesController"]);
  const { call, moduleRef } = await nestApp(t, GreetingsModule);
  assert.deepEqual((await call("GET", "/hello/he")).body, { lang: "he", text: "שלום" });
  assert.deepEqual((await call("GET", "/hello/ar")).body, { lang: "ar", text: "مرحبا" });
  assert.deepEqual((await call("GET", "/hello/en")).body, { lang: "en", text: "Hello" });
  const nf = await call("GET", "/hello/fr");
  assert.equal(nf.status, 404);
  assert.equal(nf.body?.message, "שפה fr לא נתמכת");
  assert.equal((await call("GET", "/hello/constructor")).status, 404, "constructor הוא לא שפה (Object.hasOwn / Map)");
  assert.equal((await call("GET", "/hello/toString")).status, 404);
  assert.deepEqual((await call("GET", "/languages")).body, ["ar", "en", "he"]);
  const s = moduleRef.get(GreetingsService);
  assert.ok(Object.values(moduleRef.get(HelloController)).includes(s), "HelloController מקבל את ה־service (ב־constructor)");
  assert.ok(Object.values(moduleRef.get(LanguagesController)).includes(s), "LanguagesController מקבל את אותו מופע של ה־service");
});
