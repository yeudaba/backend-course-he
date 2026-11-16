import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { normalizeUrl } = await load(import.meta.url, "P28-E65.ts");

test("אותה כתובת — אותה מחרוזת", () => {
  const same = [
    "https://Example.COM:443/Path?b=2&a=1#top",
    "  https://example.com/Path?a=1&b=2  ",
    "https://example.com/Path?utm_source=x&a=1&fbclid=zzz&b=2&utm_medium=y",
  ];
  for (const u of same) assert.equal(normalizeUrl(u), "https://example.com/Path?a=1&b=2", u);
});
test("פרטים", () => {
  assert.equal(normalizeUrl("http://x.co:80"), "http://x.co/");
  assert.equal(normalizeUrl("http://x.co:8080/a"), "http://x.co:8080/a");
  assert.equal(normalizeUrl("https://x.co/?utm_campaign=1"), "https://x.co/");
  assert.equal(normalizeUrl("https://x.co/s?tag=b&q=1&tag=a"), "https://x.co/s?q=1&tag=b&tag=a", "סדר יציב לשמות זהים");
  assert.equal(normalizeUrl("https://x.co/p?utm=1"), "https://x.co/p?utm=1", "utm בלי קו תחתון — נשאר");
});
test("לא תקין ← Error", () => {
  for (const bad of ["javascript:alert(1)", "ftp://x.co/f", "not a url", "", "mailto:a@b.c"]) {
    assert.throws(() => normalizeUrl(bad), Error, bad);
  }
});
