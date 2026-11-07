import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { toCurl } = await load(import.meta.url, "P14-E10.mjs");

test("GET פשוט", () => assert.equal(toCurl({ url: "http://localhost:4000/products" }), "curl 'http://localhost:4000/products'"));
test("POST עם אובייקט", () => assert.equal(toCurl({ method: "POST", url: "http://x/p", body: { a: 1 } }), "curl -X POST 'http://x/p' -H 'Content-Type: application/json' -d '{\"a\":1}'"));
test("headers קיימים, ו־content-type לא מוכפל", () => assert.equal(
  toCurl({ method: "PUT", url: "http://x/p/1", headers: { Authorization: "Bearer t", "content-type": "application/json" }, body: { a: 1 } }),
  "curl -X PUT 'http://x/p/1' -H 'Authorization: Bearer t' -H 'content-type: application/json' -d '{\"a\":1}'"
));
test("גוף מחרוזת — כמו שהוא", () => assert.equal(toCurl({ method: "POST", url: "http://x", body: "a=1" }), "curl -X POST 'http://x' -d 'a=1'"));
test("גרש", () => assert.equal(toCurl({ method: "DELETE", url: "http://x/it's" }), "curl -X DELETE 'http://x/it'\\''s'"));
