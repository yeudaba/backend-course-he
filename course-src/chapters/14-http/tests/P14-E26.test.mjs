import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P14-E26.mjs", ["parseCookies"])).parseCookies;

test("כמה עוגיות, עם רווחים", async () => {
  const parseCookies = await get();
  assert.deepEqual(parseCookies("theme=dark; lang=he;  size = 14 "), { theme: "dark", lang: "he", size: "14" }, "רווחים מסביב לשם ולערך מוסרים (trim)");
});
test("ערך מקודד ← decodeURIComponent", async () => {
  const parseCookies = await get();
  assert.deepEqual(parseCookies("cart=%D7%A1%D7%9C; q=a%20b"), { cart: "סל", q: "a b" });
});
test("= בתוך הערך — רק הראשון מפריד", async () => {
  const parseCookies = await get();
  assert.deepEqual(parseCookies("token=a=b=c; x=1"), { token: "a=b=c", x: "1" });
  assert.deepEqual(parseCookies("empty="), { empty: "" });
});
test("חלקים לא תקינים — מדלגים", async () => {
  const parseCookies = await get();
  assert.deepEqual(parseCookies("a=1; broken ; =x; ;b=2"), { a: "1", b: "2" });
});
test("אין header ← {}", async () => {
  const parseCookies = await get();
  assert.deepEqual(parseCookies(undefined), {}, "parseCookies(undefined)");
  assert.deepEqual(parseCookies(""), {}, 'parseCookies("")');
});
