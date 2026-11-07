import { test } from "node:test";
import assert from "node:assert/strict";
import { loadNest, nestApp } from "../../tools/nest.mjs";

const { ItemsModule, ParsePositiveIntPipe } = loadNest(import.meta.url, "P20-E16.ts");

test("ה־pipe לבד", () => {
  const pipe = new ParsePositiveIntPipe();
  assert.equal(pipe.transform("7", { type: "param", data: "id" }), 7);
  assert.equal(pipe.transform("120", { type: "param", data: "id" }), 120);
  for (const bad of ["0", "-3", "abc", "1.5", "", "7x", " 7"]) {
    assert.throws(() => pipe.transform(bad, { type: "param", data: "id" }), { message: "id חייב להיות מספר שלם חיובי" }, JSON.stringify(bad));
  }
});
test("בתוך route", async (t) => {
  const { call } = await nestApp(t, ItemsModule);
  assert.deepEqual((await call("GET", "/items/42")).body, { id: 42, type: "number" });
  const res = await call("GET", "/items/0");
  assert.equal(res.status, 400);
  assert.equal(res.body.message, "id חייב להיות מספר שלם חיובי");
});
