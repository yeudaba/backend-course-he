import { test } from "node:test";
import assert from "node:assert/strict";
import { nestApp } from "../../tools/nest.mjs";
import { exportsOf } from "./_nest.mjs";

const get = () => exportsOf(import.meta.url, "P20-E34.ts", ["VisitsModule", "VisitsService", "VisitsController"]).VisitsModule;
test("מונה, peek, ומונה לכל אפליקציה", async (t) => {
  const Mod = get();
  const a = await nestApp(t, Mod);
  assert.deepEqual((await a.call("GET", "/visits/peek")).body, { visits: 0 });
  assert.deepEqual((await a.call("GET", "/visits")).body, { visits: 1 });
  assert.deepEqual((await a.call("GET", "/visits")).body, { visits: 2 });
  assert.deepEqual((await a.call("GET", "/visits/peek")).body, { visits: 2 }, "peek לא מעלה");
  assert.deepEqual((await a.call("GET", "/visits")).body, { visits: 3 });
  const b = await nestApp(t, Mod);
  assert.deepEqual((await b.call("GET", "/visits")).body, { visits: 1 }, "אפליקציה שנייה — מונה משלה");
  assert.deepEqual((await a.call("GET", "/visits/peek")).body, { visits: 3 });
});
