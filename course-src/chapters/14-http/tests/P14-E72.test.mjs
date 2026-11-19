import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const FILE = "P14-E72.mjs";
const get = async () => (await exportsOf(import.meta.url, FILE, ["redactCurl"])).redactCurl;

test("Authorization — ה־scheme נשאר, הטוקן מוסתר", async () => {
  const redactCurl = await get();
  assert.deepEqual(redactCurl(["-H", "Authorization: Bearer eyJhbGciOi.secret"]), ["-H", "Authorization: Bearer ***"]);
  assert.deepEqual(redactCurl(["--header", "authorization: Basic dXNlcjpwYXNz"]), ["--header", "authorization: Basic ***"], "גם --header, ובלי תלות באותיות (שם ה־header נשמר כמו שנכתב)");
  assert.deepEqual(redactCurl(["-H", "AUTHORIZATION: abc123"]), ["-H", "AUTHORIZATION: ***"], "בלי רווח בערך ← הכול מוסתר");
});

test("Cookie — השמות נשארים, הערכים מוסתרים", async () => {
  const redactCurl = await get();
  assert.deepEqual(redactCurl(["-H", "Cookie: sid=8f3a; theme=dark"]), ["-H", "Cookie: sid=***; theme=***"]);
  assert.deepEqual(redactCurl(["-H", "cookie: a=1"]), ["-H", "cookie: a=***"]);
});

test("פרמטרים סודיים בכתובת", async () => {
  const redactCurl = await get();
  const [u] = redactCurl(["https://api.shop.test/orders?page=2&ApiKey=abc123&api_key=keep&token=xyz&Password=p&secret=s&key=k&q=coffee"]);
  const params = new URL(u).searchParams;
  for (const name of ["ApiKey", "token", "Password", "secret", "key"]) assert.equal(params.get(name), "***", `${name} צריך להיות מוסתר (בלי תלות באותיות)`);
  assert.equal(params.get("page"), "2", "פרמטר רגיל נשאר");
  assert.equal(params.get("api_key"), "keep", "api_key לא ברשימה (רק token, ‏key, ‏apikey, ‏password, ‏secret)");
  assert.equal(params.get("q"), "coffee", "פרמטר רגיל נשאר");
  assert.equal(new URL(u).pathname, "/orders");
  assert.deepEqual(redactCurl(["http://x.test/a?apikey=1"]).map((x) => new URL(x).searchParams.get("apikey")), ["***"], "גם http://");
});

test("השאר לא משתנה, והמקור לא משתנה", async () => {
  const redactCurl = await get();
  const args = ["curl", "-X", "POST", "https://x.test/p?page=1", "-H", "Accept: application/json", "-H", "Authorization: Bearer t", "-d", "token=abc"];
  const copy = [...args];
  const out = redactCurl(args);
  assert.deepEqual(args, copy, "את המערך המקורי לא משנים");
  assert.notEqual(out, args, "מחזירים מערך חדש");
  assert.deepEqual(out, ["curl", "-X", "POST", "https://x.test/p?page=1", "-H", "Accept: application/json", "-H", "Authorization: Bearer ***", "-d", "token=abc"], "-d token=abc אינו כתובת — נשאר");
});
