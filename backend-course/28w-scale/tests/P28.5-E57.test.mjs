import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { syncBuiltinESMExports } from "node:module";
import { load } from "../../tools/load.mjs";

const mod = await load(import.meta.url, "P28.5-E57.ts");
const { deriveAll } = mod;

const expected = (pw, salt) => crypto.pbkdf2Sync(pw, salt, 100_000, 32, "sha256").toString("hex");

test("תוצאות נכונות ובסדר", async () => {
  const pws = ["a", "סיסמה", "hunter2", "x", "long password here"];
  assert.deepEqual(await deriveAll(pws, "salt1"), pws.map((p) => expected(p, "salt1")));
  assert.deepEqual(await deriveAll([], "s"), []);
});
test("לא יותר מ־limit במקביל, וה־event loop חי", async () => {
  const real = crypto.pbkdf2;
  let now = 0, peak = 0;
  crypto.pbkdf2 = (...args) => {
    const cb = args.at(-1);
    now++; peak = Math.max(peak, now);
    return real(...args.slice(0, -1), (e, k) => { now--; cb(e, k); });
  };
  syncBuiltinESMExports();
  let ticks = 0;
  const timer = setInterval(() => ticks++, 5);
  try {
    const r = await mod.deriveAll(Array.from({ length: 8 }, (_, i) => `p${i}`), "s", 3);
    assert.equal(r.length, 8);
  } finally {
    clearInterval(timer);
    crypto.pbkdf2 = real;
    syncBuiltinESMExports();
  }
  assert.ok(peak > 0, "pbkdf2 (עם callback) לא נקרא");
  assert.ok(peak <= 3, `רצו ${peak} במקביל, מותר 3`);
  assert.ok(ticks >= 3, "ה־event loop נחסם — pbkdf2Sync?");
});
