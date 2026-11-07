import { test } from "node:test";
import assert from "node:assert/strict";
import { load, typecheck } from "../../tools/load.mjs";

const { RateLimiter } = await load(import.meta.url, "P12-E14.ts");

test("עובר בדיקת טיפוסים (tsc --strict)", () => { const r = typecheck(import.meta.url, "P12-E14.ts"); assert.ok(r.ok, r.output); });
test("מגבלה בחלון", () => { let t = 0; const rl = new RateLimiter({ limit: 2, windowMs: 1000, now: () => t }); assert.equal(rl.allow("a"), true); assert.equal(rl.allow("a"), true); assert.equal(rl.allow("a"), false); assert.equal(rl.allow("b"), true); assert.equal(rl.remaining("a"), 0); });
test("חלון זז", () => { let t = 0; const rl = new RateLimiter({ limit: 2, windowMs: 1000, now: () => t }); rl.allow("a"); t = 500; rl.allow("a"); t = 1001; assert.equal(rl.remaining("a"), 1); assert.equal(rl.allow("a"), true); assert.equal(rl.allow("a"), false); });
test("בקשה שנדחתה לא נספרת", () => { let t = 0; const rl = new RateLimiter({ limit: 1, windowMs: 100, now: () => t }); rl.allow("a"); t = 50; rl.allow("a"); t = 101; assert.equal(rl.allow("a"), true); });
