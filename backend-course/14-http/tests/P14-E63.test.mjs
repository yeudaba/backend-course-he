import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P14-E63.mjs", ["parseCurlArgs"])).parseCurlArgs;

test("POST עם גוף ו־header", async () => {
  const f = await get();
  assert.deepEqual(f(["-i", "-d", '{"a":1}', "-H", "Content-Type: application/json", "http://localhost:4000/products"]), {
    method: "POST",
    url: "http://localhost:4000/products",
    headers: { "Content-Type": "application/json" },
    body: '{"a":1}',
  });
});
test("method", async () => {
  const f = await get();
  assert.deepEqual(f(["http://x/a"]), { method: "GET", url: "http://x/a", headers: {}, body: undefined });
  assert.equal(f(["--request", "delete", "http://x/a"]).method, "DELETE", "method באותיות גדולות");
  assert.equal(f(["-X", "PUT", "-d", "x", "http://x/a"]).method, "PUT", "-X גובר על ברירת המחדל");
  assert.equal(f(["-d", "", "http://x/a"]).method, "POST", "גם גוף ריק הוא גוף");
  assert.equal(f(["-d", "", "http://x/a"]).body, "");
  assert.equal(f(["--data", "q=1", "http://x/a"]).body, "q=1");
});
test("headers", async () => {
  const f = await get();
  const r = f(["http://x", "--header", "Authorization:  Bearer a:b ", "-H", "X-Request-Id:7", "-v", "-s"]);
  assert.deepEqual(r.headers, { Authorization: "Bearer a:b", "X-Request-Id": "7" }, "מפרקים לפי ה־: הראשון ומורידים רווחים");
  assert.equal(r.url, "http://x", "ערכים של דגלים לא נחשבים לכתובת");
});
test("שגיאות", async () => {
  const f = await get();
  assert.throws(() => f(["-L", "http://x"]), { message: "דגל לא מוכר: -L" });
  assert.throws(() => f(["--compressed", "http://x"]), { message: "דגל לא מוכר: --compressed" });
  assert.throws(() => f(["-i"]), { message: "חסרה כתובת" });
  assert.throws(() => f(["-H", "Accept: */*"]), { message: "חסרה כתובת" });
});
