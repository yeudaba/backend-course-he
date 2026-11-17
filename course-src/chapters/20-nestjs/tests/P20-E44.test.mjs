import { test } from "node:test";
import assert from "node:assert/strict";
import { nestApp } from "../../tools/nest.mjs";
import { exportsOf } from "./_nest.mjs";

test("אחד, הרבה, 404 ו־500", async (t) => {
  const { UsersModule } = exportsOf(import.meta.url, "P20-E44.ts", ["UsersModule", "UsersService", "UsersController"]);
  const { call } = await nestApp(t, UsersModule);
  assert.deepEqual((await call("GET", "/users/2")).body, { id: 2, name: "Yossi" });
  const nf = await call("GET", "/users/5");
  assert.equal(nf.status, 404);
  assert.equal(nf.body?.message, "משתמש 5 לא נמצא");
  const boom = await call("GET", "/users/13");
  assert.equal(boom.status, 500);
  assert.doesNotMatch(JSON.stringify(boom.body), /db timeout/, "ההודעה הפנימית לא נשלחת ללקוח");
  assert.deepEqual((await call("GET", "/users?ids=2,9,1")).body, [{ id: 2, name: "Yossi" }, { id: 1, name: "Dana" }]);
  assert.equal((await call("GET", "/users?ids=1,13")).status, 500, "תקלה אמיתית — לא 'לא נמצא'");
  const start = Date.now();
  const many = await call("GET", "/users?ids=" + Array.from({ length: 10 }, (_, i) => (i % 2) + 1).join(","));
  assert.equal(many.body.length, 10);
  assert.ok(Date.now() - start < 150, `10 מזהים לקחו ${Date.now() - start}ms — צריך Promise.all (כ־20ms)`);
});
