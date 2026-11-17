import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P15.5-E75.mjs", ["resolveStatic"])).resolveStatic;
const root = path.resolve("/srv/web");
const html = "text/html; charset=utf-8";
test("קבצים בתוך התיקייה", async () => {
  const f = await get();
  assert.deepEqual(f(root, "/"), { file: path.join(root, "index.html"), type: html });
  assert.deepEqual(f(root, "/docs/"), { file: path.join(root, "docs", "index.html"), type: html });
  assert.deepEqual(f(root, "/app.JS?v=3"), { file: path.join(root, "app.JS"), type: "text/javascript; charset=utf-8" });
  assert.deepEqual(f(root, "/css/style.css"), { file: path.join(root, "css", "style.css"), type: "text/css; charset=utf-8" });
  assert.deepEqual(f(root, "/logo.svg"), { file: path.join(root, "logo.svg"), type: "image/svg+xml" });
  assert.deepEqual(f(root, "/a.PNG"), { file: path.join(root, "a.PNG"), type: "image/png" });
  assert.deepEqual(f(root, "/logo.webp"), { file: path.join(root, "logo.webp"), type: "application/octet-stream" });
  assert.deepEqual(f(root, "/%D7%A9%D7%9C%D7%95%D7%9D.html"), { file: path.join(root, "שלום.html"), type: html });
  assert.deepEqual(f(root, "/a/../b.css"), { file: path.join(root, "b.css"), type: "text/css; charset=utf-8" });
});
test("מחוץ לתיקייה ← null", async () => {
  const f = await get();
  for (const u of ["/%2E%2E%2F.env", "/%2e%2e%2fsecret.txt", "/x/..%2F..%2F..%2Fetc%2Fpasswd", "/..%2Fweb-backup%2Fx.html"]) {
    assert.equal(f(root, u), null, `${u} ← null`);
  }
});
test("פענוח שנכשל ← null", async () => {
  const f = await get();
  assert.equal(f(root, "/%E0%A4%A"), null);
  assert.equal(f(root, "/%"), null);
});
