import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { load } from "../../tools/load.mjs";

const { hashCode, codeFor } = await load(import.meta.url, "P28-E63.ts");

const A = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
function ref(url, length = 7) {
  let n = createHash("sha256").update(url).digest().readUIntBE(0, 6) % 62 ** length;
  let s = "";
  do { s = A[n % 62] + s; n = Math.floor(n / 62); } while (n > 0);
  return s.padStart(length, "0");
}

test("hashCode — דטרמיניסטי, באורך הנכון", () => {
  const urls = ["https://example.com", "https://example.com/a?b=1", "http://x.co", "https://course.example/28"];
  for (const u of urls) {
    assert.equal(hashCode(u), ref(u), u);
    assert.equal(hashCode(u).length, 7);
    assert.equal(hashCode(u, 4), ref(u, 4));
    assert.equal(hashCode(u, 10), ref(u, 10));
  }
  assert.equal(hashCode("https://example.com"), hashCode("https://example.com"));
  assert.notEqual(hashCode("https://example.com"), hashCode("https://example.com/"));
  // ריפוד: מחפשים URL שהקוד שלו קצר באורך 2 מתחיל ב־0
  let found = false;
  for (let i = 0; i < 2000 && !found; i++) {
    const u = `https://e.com/${i}`;
    if (ref(u, 2)[0] === "0") { assert.equal(hashCode(u, 2), ref(u, 2)); found = true; }
  }
  assert.ok(found);
});
test("codeFor — מלח #1, #2… ועד 5 ניסיונות", () => {
  const u = "https://example.com/page";
  assert.equal(codeFor(u, new Set()), ref(u));
  const taken = new Set([ref(u), ref(u + "#1")]);
  assert.equal(codeFor(u, taken), ref(u + "#2"));
  assert.equal(taken.size, 2, "לא מוסיפים ל־taken");
  assert.equal(codeFor(u, new Set([ref(u, 4)]), 4), ref(u + "#1", 4));
  const all = new Set([ref(u), ref(u + "#1"), ref(u + "#2"), ref(u + "#3"), ref(u + "#4")]);
  assert.throws(() => codeFor(u, all));
  all.delete(ref(u + "#4"));
  assert.equal(codeFor(u, all), ref(u + "#4"));
});
