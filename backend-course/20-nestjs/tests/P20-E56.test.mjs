import { test } from "node:test";
import assert from "node:assert/strict";
import { nestApp } from "../../tools/nest.mjs";
import { exportsOf } from "./_nest.mjs";

test("עמודים וקישורים", async (t) => {
  const { ArticlesModule } = exportsOf(import.meta.url, "P20-E56.ts", ["ArticlesModule", "ListArticlesQuery", "ArticlesController"]);
  const { call } = await nestApp(t, ArticlesModule, { validation: true });
  const first = (await call("GET", "/articles")).body;
  assert.deepEqual(first.data.map((a) => a.id), [1, 2, 3, 4, 5]);
  assert.deepEqual(first.meta, { page: 1, limit: 5, total: 30, pages: 6 });
  assert.deepEqual(first.links, { self: "/articles?page=1&limit=5", next: "/articles?page=2&limit=5", prev: null });
  const last = (await call("GET", "/articles?page=4&limit=8")).body;
  assert.deepEqual(last.data.map((a) => a.id), [25, 26, 27, 28, 29, 30]);
  assert.deepEqual(last.links, { self: "/articles?page=4&limit=8", next: null, prev: "/articles?page=3&limit=8" });
  const mid = (await call("GET", "/articles?page=3")).body;
  assert.deepEqual(mid.links, { self: "/articles?page=3&limit=5", next: "/articles?page=4&limit=5", prev: "/articles?page=2&limit=5" });
  const nest = (await call("GET", "/articles?q=NEST&limit=1")).body;
  assert.deepEqual(nest.data, [{ id: 7, title: "Nest Tips" }]);
  assert.deepEqual(nest.meta, { page: 1, limit: 1, total: 2, pages: 2 });
  assert.deepEqual(nest.links, { self: "/articles?q=NEST&page=1&limit=1", next: "/articles?q=NEST&page=2&limit=1", prev: null });
  const none = (await call("GET", "/articles?q=" + encodeURIComponent("a&page=9"))).body;
  assert.deepEqual(none.meta, { page: 1, limit: 5, total: 0, pages: 0 });
  assert.deepEqual(none.links, { self: "/articles?q=a%26page%3D9&page=1&limit=5", next: null, prev: null }, "q מקודד");
  for (const qs of ["?page=0", "?limit=21", "?page=abc"]) assert.equal((await call("GET", "/articles" + qs)).status, 400, qs);
});
