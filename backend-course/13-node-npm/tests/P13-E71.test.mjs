import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P13-E71.mjs", ["redact"])).redact;

test("מפתחות רגישים בכל עומק, בלי לשנות את המקור", async () => {
  const redact = await get();
  const config = {
    port: 3000,
    db: { url: "postgres://dana:Sup3r@localhost:5432/shop", password: "Sup3r" },
    jwtSecret: "abc",
    apiKeys: { stripe: "sk_1" },
    admins: [{ email: "a@x.com", resetToken: "t1" }],
    PASSWORD_HINT: "x",
  };
  const before = JSON.stringify(config);
  assert.deepEqual(redact(config), {
    port: 3000,
    db: { url: "postgres://dana:***@localhost:5432/shop", password: "***" },
    jwtSecret: "***",
    apiKeys: "***",
    admins: [{ email: "a@x.com", resetToken: "***" }],
    PASSWORD_HINT: "***",
  });
  assert.equal(JSON.stringify(config), before, "המקור השתנה");
});
test("ערכים שאינם אובייקטים, ומחרוזות עם URL", async () => {
  const redact = await get();
  assert.equal(redact(5), 5);
  assert.equal(redact(null), null);
  assert.equal(redact("redis://:pw@host:6379"), "redis://:pw@host:6379", "בלי שם משתמש — לא בפורמט user:pass");
  assert.equal(redact("mongodb://u:p%40ss@a,b/db and https://x:y@z.com"), "mongodb://u:***@a,b/db and https://x:***@z.com");
  assert.equal(redact("https://example.com/path"), "https://example.com/path");
  assert.deepEqual(redact(["postgres://a:b@c/d", { token: { deep: 1 } }]), ["postgres://a:***@c/d", { token: "***" }]);
});
