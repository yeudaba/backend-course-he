import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25-E56.ts", ["maskLog"])).maskLog;
const b64 = (s) => Buffer.from(s).toString("base64");
const b64u = (s) => Buffer.from(s).toString("base64url");

test("הסוד וכל הצורות שלו", async () => {
  const f = await get();
  const s = "s3cr3t/deploy+key=1??";
  const log = `a ${s} b ${b64(s)} c ${b64u(s)} d ${encodeURIComponent(s)} e ${s}`;
  assert.equal(f(log, [s]), "a *** b *** c *** d *** e ***");
});
test("קצרים — לא; ארוכים קודם", async () => {
  const f = await get();
  assert.equal(f("abc and abcd", ["abc", "abcd"]), "abc and ***");
  assert.equal(f("token=supersecret-long and secret", ["secret", "supersecret-long"]), "token=*** and ***", "הארוך קודם — בלי 'super***-long'");
  assert.equal(f("nothing", []), "nothing");
});
test("תווים מיוחדים ב־regex", async () => {
  const f = await get();
  assert.equal(f("x a.b*c(d) y a-b-c", ["a.b*c(d)"]), "x *** y a-b-c");
  assert.equal(f("$1$2 $&", ["$1$2 $&"]), "***");
});
