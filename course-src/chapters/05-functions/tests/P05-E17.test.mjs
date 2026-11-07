import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { toSlug, truncate } = await load(import.meta.url, "P05-E17.js");

test("toSlug בסיסי", () => assert.equal(toSlug("Learn Node JS"), "learn-node-js"));
test("toSlug עם רווחים בקצוות ורווחים כפולים", () => assert.equal(toSlug("  Learn   Node JS  "), "learn-node-js"));
test("truncate קוצר לאורך מדויק", () => {
  const r = truncate("Backend development with Node.js", 15);
  assert.equal(r, "Backend deve...");
  assert.equal(r.length, 15);
});
test("truncate לא נוגע בטקסט קצר", () => { assert.equal(truncate("short", 10), "short"); assert.equal(truncate("exactly10!", 10), "exactly10!"); });
