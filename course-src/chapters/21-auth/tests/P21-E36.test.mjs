import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P21-E36.ts", ["redact"])).redact;
const R = "[REDACTED]";

test("רמה אחת, בלי תלות באותיות", async () => {
  const redact = await get();
  assert.deepEqual(redact({ email: "d@x.co", password: "hunter22" }), { email: "d@x.co", password: R });
  assert.deepEqual(
    redact({ Authorization: "Bearer eyJ", cookie: "sid=1", "x-api-key": "k", newPassword: "a", refreshToken: "b", clientSecret: "c", tokenType: "Bearer" }),
    { Authorization: R, cookie: R, "x-api-key": "k", newPassword: R, refreshToken: R, clientSecret: R, tokenType: R },
  );
});
test("לעומק, ומערכים", async () => {
  const redact = await get();
  const input = { user: { name: "dana", password: "p", tags: ["a", "b"] }, sessions: [{ id: 1, accessToken: "t1" }, { id: 2, accessToken: "t2" }], count: 3, nothing: null };
  const copy = structuredClone(input);
  assert.deepEqual(redact(input), { user: { name: "dana", password: R, tags: ["a", "b"] }, sessions: [{ id: 1, accessToken: R }, { id: 2, accessToken: R }], count: 3, nothing: null });
  assert.deepEqual(input, copy, "הקלט לא השתנה");
  assert.deepEqual(redact([{ password: 1 }, [{ PASSWORD: 2 }]]), [{ password: R }, [{ PASSWORD: R }]]);
  assert.deepEqual(redact({ password: { nested: true } }), { password: R }, "מפתח רגיש — כל הערך מוחלף, גם אם הוא אובייקט");
});
test("ערכים פשוטים", async () => {
  const redact = await get();
  for (const v of ["password", 5, null, true, undefined]) assert.equal(redact(v), v);
});
test("הרבה מפתחות רגישים ברצף (בלי regex עם g)", async () => {
  const redact = await get();
  const out = redact({ a: { password: 1 }, b: { password: 2 }, c: { password: 3 }, d: { password: 4 } });
  assert.deepEqual(out, { a: { password: R }, b: { password: R }, c: { password: R }, d: { password: R } });
});
