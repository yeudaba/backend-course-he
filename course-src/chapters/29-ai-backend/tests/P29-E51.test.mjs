import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { safeLinks } = await load(import.meta.url, "P29-E51.ts");
const HOSTS = ["shop.example", "docs.shop.example"];

test("קישורי Markdown", () => {
  const md = "ראו [דף המוצר](https://shop.example/p/1) ו־[מבצע](https://evil.net/x) ו־[ישן](http://shop.example/a) ו־[משנה](https://help.shop.example/faq).";
  assert.deepEqual(safeLinks(md, HOSTS), {
    text: "ראו [דף המוצר](https://shop.example/p/1) ו־מבצע ו־ישן ו־[משנה](https://help.shop.example/faq).",
    removed: ["https://evil.net/x", "http://shop.example/a"],
  });
});
test("URL חשוף", () => {
  const md = "כנסו ל־https://shop.example.evil.net/login או https://shop.example/cart עכשיו";
  assert.deepEqual(safeLinks(md, HOSTS), { text: "כנסו ל־[קישור הוסר] או https://shop.example/cart עכשיו", removed: ["https://shop.example.evil.net/login"] });
  assert.deepEqual(safeLinks("בלי קישורים", HOSTS), { text: "בלי קישורים", removed: [] });
  assert.deepEqual(safeLinks("[x](javascript:alert)", HOSTS).text, "x");
});
