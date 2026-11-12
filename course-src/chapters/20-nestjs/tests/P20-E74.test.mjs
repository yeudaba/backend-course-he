import { test } from "node:test";
import assert from "node:assert/strict";
import { nestApp } from "../../tools/nest.mjs";
import { exportsOf } from "./_nest.mjs";

test("Location", async (t) => {
  const { LinksModule } = exportsOf(import.meta.url, "P20-E74.ts", ["LinksModule", "LinksController"]);
  const { call } = await nestApp(t, LinksModule);
  const a = await call("POST", "/links", { url: "https://nestjs.com" });
  assert.equal(a.status, 201);
  assert.deepEqual(a.body, { id: 1, url: "https://nestjs.com" });
  assert.equal(a.headers.get("location"), "/links/1");
  const b = await call("POST", "/links", { url: "https://prisma.io" });
  assert.equal(b.headers.get("location"), "/links/2");
  assert.deepEqual((await call("GET", b.headers.get("location"))).body, { id: 2, url: "https://prisma.io" }, "הקישור ב־Location עובד");
  assert.equal((await call("GET", "/links/3")).status, 404);
});
