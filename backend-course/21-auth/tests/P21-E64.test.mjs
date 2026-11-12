import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = () => exportsOf(import.meta.url, "P21-E64.ts", ["refreshCookie", "clearRefreshCookie", "readRefreshCookie"]);
const parts = (s) => s.split("; ");

test("refreshCookie", async () => {
  const { refreshCookie } = await get();
  assert.equal(refreshCookie("abc_-123", 604800), "refresh_token=abc_-123; Max-Age=604800; Path=/auth; HttpOnly; Secure; SameSite=Strict");
  const p = parts(refreshCookie("xyz", 60));
  assert.equal(p[0], "refresh_token=xyz");
  assert.ok(p.includes("Max-Age=60"));
});
test("clearRefreshCookie", async () => {
  const { clearRefreshCookie } = await get();
  assert.equal(clearRefreshCookie(), "refresh_token=; Max-Age=0; Path=/auth; HttpOnly; Secure; SameSite=Strict", "ערך ריק, Max-Age=0 — ואותו Path");
});
test("readRefreshCookie", async () => {
  const { readRefreshCookie } = await get();
  assert.equal(readRefreshCookie("a=1; refresh_token=xyz; b=2"), "xyz");
  assert.equal(readRefreshCookie("refresh_token=abc"), "abc");
  assert.equal(readRefreshCookie("theme=dark;refresh_token=t=="), "t==", "הכול אחרי ה־= הראשון");
  assert.equal(readRefreshCookie("my_refresh_token=nope; theme=dark"), null, "שם אחר");
  assert.equal(readRefreshCookie("refresh_token=; a=1"), null, "ערך ריק ← null");
  assert.equal(readRefreshCookie(""), null);
  assert.equal(readRefreshCookie(undefined), null);
  assert.equal(readRefreshCookie("broken; refresh_token=ok"), "ok", "חלק בלי = לא מפריע");
});
