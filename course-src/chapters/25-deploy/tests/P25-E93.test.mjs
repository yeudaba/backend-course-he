import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25-E93.ts", ["apiBase"])).apiBase;
const page = (meta) => `<!doctype html><html><head><meta charset="utf-8">${meta}<title>tasks</title></head><body></body></html>`;

test("מקומית", async () => {
  const f = await get();
  assert.equal(f(page(""), "http://localhost:5500/"), "http://localhost:3000");
  assert.equal(f(page(""), "http://127.0.0.1:8080/index.html"), "http://localhost:3000");
});
test("בפריסה", async () => {
  const f = await get();
  assert.equal(f(page('<meta name="api-url" content="https://tasks-api-x1.onrender.com/">'), "https://tasks-web.onrender.com/"), "https://tasks-api-x1.onrender.com");
  assert.equal(f(page('<meta content="https://api.example.com" name="api-url">'), "https://example.com/"), "https://api.example.com", "סדר תכונות אחר");
  assert.equal(f(page('<meta name="description" content="x">\n<META NAME="api-url" CONTENT="https://a.b">'), "https://example.com/"), "https://a.b");
});
test("שגיאות", async () => {
  const f = await get();
  assert.throws(() => f(page('<meta name="description" content="https://x.com">'), "https://w.com/"), { message: "חסר api-url" });
  assert.throws(() => f(page('<meta name="api-url" content="https://YOUR-SERVICE.onrender.com">'), "https://w.com/"), { message: "api-url לא הוגדר" });
  assert.throws(() => f(page('<meta name="api-url" content="http://tasks-api.onrender.com">'), "https://w.com/"), { message: "mixed content" });
  assert.equal(f(page('<meta name="api-url" content="http://api.internal">'), "http://w.internal/"), "http://api.internal", "דף ב־http — מותר");
});
