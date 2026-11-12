import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P21-E34.ts", ["normalizeEmail"])).normalizeEmail;

test("מנרמל", async () => {
  const norm = await get();
  assert.equal(norm("  Dana@Example.COM "), "dana@example.com");
  assert.equal(norm("yossi.levi+tasks@mail.co.il"), "yossi.levi+tasks@mail.co.il");
  assert.equal(norm("\tA@B.CO\n"), "a@b.co", "גם טאב ושורה חדשה בקצוות");
});
test("לא תקין ← null", async () => {
  const norm = await get();
  for (const bad of ["", "   ", "dana", "dana@", "@example.com", "dana@@example.com", "a@b@c.com", "dana@example", "dana@.example.com", "dana@example.com.", "da na@example.com", "dana@exa mple.com"]) {
    assert.equal(norm(bad), null, `normalizeEmail(${JSON.stringify(bad)})`);
  }
});
test("עד 254 תווים", async () => {
  const norm = await get();
  const ok = "a".repeat(254 - "@example.com".length) + "@example.com";
  assert.equal(norm(ok), ok, "בדיוק 254 — תקין");
  assert.equal(norm("a" + ok), null, "255 — ארוך מדי");
  assert.equal(norm("  " + ok.toUpperCase() + "  "), ok, "האורך נבדק אחרי trim");
});
