// P22-E102: הבדיקות ירוקות — אבל באגים שורדים. תקן וחזק אותן (האפליקציה ב־P22-E102.ts לא משתנה).
//
// הרצה:   node --test 22-testing/starter/P22-E102.spec.ts
// בדיקה:  npm run check P22-E102
import { test, after } from "node:test";
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { createApp } from "./P22-E102.ts";

const server = createApp().listen(0);
await new Promise((resolve) => server.once("listening", resolve));
after(() => server.close());
const base = `http://localhost:${(server.address() as AddressInfo).port}`;
const call = (method: string, path: string, body?: unknown) =>
  fetch(base + path, { method, headers: { "content-type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });

test("POST יוצר פריט", async () => {
  const res = await call("POST", "/items", { name: "Mug" });
  assert.ok(res.ok);
  const item = await res.json();
  assert.equal(item.name, "Mug");
});

test("name ריק נדחה", async () => {
  const res = await call("POST", "/items", { name: "" });
  assert.ok(!res.ok);
});

test("GET מחזיר את הפריט", async () => {
  const res = await call("GET", "/items/1");
  assert.equal(res.status, 200);
});

test("DELETE", async () => {
  const res = await call("DELETE", "/items/1");
  assert.ok(res.status < 300);
});
