import { test } from "node:test";
import assert from "node:assert/strict";
import { loadNest, nestApp } from "../../tools/nest.mjs";

const { AppModule, OrdersModule, UsersService } = loadNest(import.meta.url, "P20-E13.ts");

test("OrdersModule עולה לבד — UsersService מגיע דרך imports", async (t) => {
  const { call, moduleRef } = await nestApp(t, OrdersModule);
  const res = await call("POST", "/orders", { userId: 2, item: "Mug" });
  assert.equal(res.status, 201);
  assert.deepEqual(res.body, { id: 1, item: "Mug", user: { id: 2, name: "Yossi" } });
  assert.equal((await call("POST", "/orders", { userId: 9, item: "Mug" })).status, 404);
  assert.ok(moduleRef.get(UsersService, { strict: false }), "UsersService זמין");
});
test("AppModule: אותו מופע של UsersService בשני ה־modules", async (t) => {
  const { call } = await nestApp(t, AppModule);
  assert.deepEqual((await call("GET", "/users/1")).body, { id: 1, name: "Dana" });
  assert.equal((await call("GET", "/users/7")).status, 404);
  assert.equal((await call("POST", "/orders", { userId: 1, item: "Jug" })).body.user.name, "Dana");
});
