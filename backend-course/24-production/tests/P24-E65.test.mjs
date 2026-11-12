import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { exportsOf } from "./_ts.mjs";

const get = () => exportsOf(import.meta.url, "P24-E65.ts", ["canonicalJson", "fingerprint"]);

test("canonicalJson — מפתחות ממוינים בכל עומק", async () => {
  const { canonicalJson } = await get();
  assert.equal(canonicalJson({ b: 1, a: 2 }), '{"a":2,"b":1}');
  assert.equal(canonicalJson({ z: { y: 1, x: [{ d: 1, c: 2 }] }, a: null }), '{"a":null,"z":{"x":[{"c":2,"d":1}],"y":1}}');
  assert.equal(canonicalJson(["b", "a"]), '["b","a"]', "מערך — באותו סדר");
  assert.equal(canonicalJson({ a: undefined, b: 1 }), '{"b":1}', "undefined באובייקט — נעלם");
  assert.equal(canonicalJson([1, undefined]), "[1,null]", "undefined במערך — null, כמו JSON.stringify");
  assert.equal(canonicalJson({ 'q"k': "חלב\n" }), '{"q\\"k":"חלב\\n"}', "escaping של מפתחות וערכים");
  for (const v of [1, "x", true, null, 1.5, [], {}]) assert.equal(canonicalJson(v), JSON.stringify(v));
});
test("canonicalJson — אותו תוכן, סדר אחר ← אותה מחרוזת", async () => {
  const { canonicalJson } = await get();
  const a = { title: "חלב", meta: { tags: ["x"], priority: 1 }, n: 0 };
  const b = { n: 0, meta: { priority: 1, tags: ["x"] }, title: "חלב" };
  assert.equal(canonicalJson(a), canonicalJson(b));
  assert.equal(JSON.parse(canonicalJson(a)).meta.priority, 1, "התוצאה היא JSON תקין");
});
test("fingerprint", async () => {
  const { fingerprint } = await get();
  const want = createHash("sha256").update('POST /tasks\n{"priority":1,"title":"חלב"}').digest("hex");
  assert.equal(fingerprint("post", "/tasks", { title: "חלב", priority: 1 }), want);
  assert.equal(fingerprint("POST", "/tasks", { priority: 1, title: "חלב" }), want);
  assert.notEqual(fingerprint("POST", "/projects", { title: "חלב", priority: 1 }), want, "נתיב אחר");
  assert.notEqual(fingerprint("PUT", "/tasks", { title: "חלב", priority: 1 }), want, "method אחר");
  assert.notEqual(fingerprint("POST", "/tasks", { tags: ["a", "b"] }), fingerprint("POST", "/tasks", { tags: ["b", "a"] }));
  assert.match(fingerprint("GET", "/", null), /^[0-9a-f]{64}$/);
});
