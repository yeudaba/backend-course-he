import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen, api } from "../../tools/load.mjs";

const { createApp } = await load(import.meta.url, "P15-E08.ts");
async function start(t, app) {
  const { base, close } = await listen(app);
  t.after(close);
  return api(base);
}

test("יצירה ומחיקה", async (t) => {
  const call = await start(t, createApp());
  assert.deepEqual((await call("GET", "/products")).body, []);
  const created = await call("POST", "/products", { name: "  מסך ", price: 899 });
  assert.equal(created.status, 201);
  assert.equal(created.headers.get("location"), "/products/1");
  assert.deepEqual(created.body, { id: 1, name: "מסך", price: 899 });
  assert.equal((await call("POST", "/products", { name: "עכבר", price: 89 })).body.id, 2);
  assert.equal((await call("DELETE", "/products/1")).status, 204);
  assert.deepEqual((await call("GET", "/products")).body.map((p) => p.id), [2]);
  assert.equal((await call("DELETE", "/products/1")).status, 404);
});
test("קלט לא תקין", async (t) => {
  const call = await start(t, createApp());
  for (const body of [{}, { name: "  ", price: 5 }, { name: "x", price: "5" }, { name: "x", price: 0 }, { name: 5, price: 5 }]) {
    const res = await call("POST", "/products", body);
    assert.equal(res.status, 400, JSON.stringify(body));
    assert.equal(typeof res.body.error, "string");
  }
  assert.equal((await call("POST", "/products")).status, 400, "בלי גוף בכלל");
  assert.equal((await call("POST", "/products", undefined, { raw: "{oops" })).status, 400, "JSON שבור");
  assert.deepEqual((await call("GET", "/products")).body, []);
});
test("כל אפליקציה מתחילה ריקה", async (t) => {
  const a = await start(t, createApp());
  await a("POST", "/products", { name: "א", price: 1 });
  const b = await start(t, createApp());
  assert.deepEqual((await b("GET", "/products")).body, []);
});
