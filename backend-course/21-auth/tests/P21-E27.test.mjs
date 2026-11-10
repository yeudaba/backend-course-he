import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe, code } from "./_ts.mjs";

const FILE = "P21-E27.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["parseAuthorization"])).parseAuthorization;
const basic = (s) => "Basic " + Buffer.from(s).toString("base64");

test("עובר בדיקת טיפוסים, ו־Credentials הוא union", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
  const p = typeProbe(import.meta.url, FILE, `import { parseAuthorization, type Credentials } from "FILE";
const c = parseAuthorization("Bearer x");
if (c && c.scheme === "basic") { const u: string = c.username; }
if (c && c.scheme === "bearer") { const t: string = c.token; }
// @ts-expect-error — ל־bearer אין username
const bad: Credentials = { scheme: "bearer", username: "x" };
`);
  assert.ok(p.ok, p.message);
});
test("Bearer", async () => {
  const parse = await get();
  assert.deepEqual(parse("Bearer eyJhbGciOi.eyJzdWIiOjd9.c2ln"), { scheme: "bearer", token: "eyJhbGciOi.eyJzdWIiOjd9.c2ln" });
  assert.deepEqual(parse("  bearer   abc-_~+/=  "), { scheme: "bearer", token: "abc-_~+/=" }, "scheme בלי תלות באותיות, ורווחים בקצוות ובאמצע לא מפריעים");
  assert.equal(parse("Bearer abc!def"), null, "תו לא חוקי בטוקן");
  assert.equal(parse("Bearer a=b"), null, "= מותר רק בסוף");
});
test("Basic", async () => {
  const parse = await get();
  assert.deepEqual(parse(basic("dana:secret")), { scheme: "basic", username: "dana", password: "secret" });
  assert.deepEqual(parse("BASIC " + Buffer.from("dana:pa:ss").toString("base64")), { scheme: "basic", username: "dana", password: "pa:ss" }, "רק הנקודתיים הראשונות מפרידות");
  assert.deepEqual(parse(basic("dana:")), { scheme: "basic", username: "dana", password: "" });
  assert.equal(parse(basic("dana")), null, "בלי נקודתיים");
  assert.equal(parse(basic(":secret")), null, "שם משתמש ריק");
});
test("לא תקין ← null", async () => {
  const parse = await get();
  for (const h of [undefined, "", "Bearer", "Bearer ", "Token abc", "Bearer a b", "abc"]) {
    assert.equal(parse(h), null, `parseAuthorization(${JSON.stringify(h)})`);
  }
});
test("switch ו־regex", () => {
  const src = code(import.meta.url, FILE);
  assert.match(src, /\bswitch\s*\(/, "התרגיל מתרגל switch (פרק 4) על ה־scheme");
  assert.match(src, /\.(match|test|exec)\s*\(/, "התרגיל מתרגל regex (P13-E26)");
});
