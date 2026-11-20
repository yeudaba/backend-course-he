import { test } from "node:test";
import assert from "node:assert/strict";
import { nestApp } from "../../tools/nest.mjs";
import { exportsOf } from "./_nest.mjs";

const { AppModule } = exportsOf(import.meta.url, "P20-E84.ts", ["AppModule", "GreetingsModule", "StatusModule", "GreetingsService"]);

test("האפליקציה עולה, ו־/greetings/:lang עונה", async (t) => {
  const { call } = await nestApp(t, AppModule);
  assert.deepEqual((await call("GET", "/greetings/he")).body, { text: "שלום" });
  assert.deepEqual((await call("GET", "/greetings/en")).body, { text: "Hello" });
  assert.deepEqual((await call("GET", "/greetings/fr")).body, { text: "Hello" });
});
test("/status דרך StatusModule", async (t) => {
  const { call } = await nestApp(t, AppModule);
  const r = await call("GET", "/status");
  assert.equal(r.status, 200, "/status — האם StatusModule מיובא ב־AppModule?");
  assert.deepEqual(r.body, { status: "ok" });
});
