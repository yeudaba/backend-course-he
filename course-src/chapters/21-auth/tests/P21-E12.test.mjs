import { test } from "node:test";
import assert from "node:assert/strict";
import { loadNest, nestApp } from "../../tools/nest.mjs";

const { TokenService, TokensModule, CLOCK } = loadNest(import.meta.url, "P21-E12.ts");

test("תוקף לפי CLOCK", async (t) => {
  const clock = { now: new Date("2026-11-04T10:00:00Z") };
  const { moduleRef } = await nestApp(t, TokensModule, { overrides: [[CLOCK, { now: () => clock.now }]] });
  const tokens = moduleRef.get(TokenService);
  const token = await tokens.issue(42);
  const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
  assert.equal(payload.iat, Date.parse("2026-11-04T10:00:00Z") / 1000, "iat מהשעון");
  assert.equal(payload.exp, payload.iat + 900);
  clock.now = new Date("2026-11-04T10:14:59Z");
  assert.deepEqual(await tokens.verify(token), { userId: 42 });
  clock.now = new Date("2026-11-04T10:15:00Z");
  await assert.rejects(tokens.verify(token), (err) => err.getStatus?.() === 401 && err.message === "פג תוקף הטוקן");
  await assert.rejects(tokens.verify("abc"), (err) => err.getStatus?.() === 401 && err.message === "טוקן לא תקין");
});
