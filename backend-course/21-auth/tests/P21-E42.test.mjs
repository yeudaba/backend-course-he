import { test } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P21-E42.ts", ["UsersRegistry"])).UsersRegistry;

test("הרשמה רגילה", async () => {
  const UsersRegistry = await get();
  const r = new UsersRegistry(4);
  assert.deepEqual(await r.register("  Dana@Example.com ", "password-1"), { id: 1, email: "dana@example.com" });
  assert.deepEqual(await r.register("yossi@example.com", "password-2"), { id: 2, email: "yossi@example.com" });
  const u = r.findByEmail("DANA@example.com");
  assert.equal(u?.id, 1);
  assert.equal(bcrypt.getRounds(u.passwordHash), 4, "bcrypt hash עם ה־rounds מה־constructor");
  assert.ok(await bcrypt.compare("password-1", u.passwordHash));
  await assert.rejects(r.register("dana@example.com ", "other-pass"), { message: "EMAIL_TAKEN" });
  assert.equal(r.size, 2);
  assert.equal(r.findByEmail("nobody@example.com"), undefined);
});
test("5 הרשמות באותו רגע — בדיוק אחת מצליחה", async () => {
  const UsersRegistry = await get();
  const r = new UsersRegistry(5);
  const results = await Promise.allSettled(["same@x.co", "SAME@x.co", " same@x.co", "same@X.co", "same@x.co"].map((e, i) => r.register(e, `password-${i}`)));
  const ok = results.filter((x) => x.status === "fulfilled");
  assert.equal(ok.length, 1, `הצליחו ${ok.length} הרשמות במקום אחת — הבדיקה "קיים?" צריכה לקרות גם אחרי ה־await של bcrypt.hash`);
  assert.ok(results.filter((x) => x.status === "rejected").every((x) => x.reason?.message === "EMAIL_TAKEN"));
  assert.equal(r.size, 1);
  assert.deepEqual(ok[0].value, { id: 1, email: "same@x.co" });
  assert.deepEqual(await r.register("next@x.co", "password-9"), { id: 2, email: "next@x.co" }, "ids רצים בלי חורים");
});
