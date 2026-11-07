import { test } from "node:test";
import assert from "node:assert/strict";
import { load, typecheck } from "../../tools/load.mjs";

const { MemoryLogger, PrefixLogger, processOrders } = await load(import.meta.url, "P12-E10.ts");

test("עובר בדיקת טיפוסים (tsc --strict)", () => { const r = typecheck(import.meta.url, "P12-E10.ts"); assert.ok(r.ok, r.output); });
test("MemoryLogger", () => { const m = new MemoryLogger(); m.info("a"); m.error("b"); assert.deepEqual(m.lines, ["INFO: a", "ERROR: b"]); m.lines.push("x"); assert.equal(m.lines.length, 2); });
test("PrefixLogger עוטף כל Logger", () => { const seen = []; const fake = { info: (s) => seen.push(`i:${s}`), error: (s) => seen.push(`e:${s}`) }; const p = new PrefixLogger(fake, "[x]"); p.info("1"); p.error("2"); assert.deepEqual(seen, ["i:[x] 1", "e:[x] 2"]); });
test("processOrders", () => { const m = new MemoryLogger(); assert.equal(processOrders([1, -2, 3], m), 2); assert.deepEqual(m.lines, ["INFO: order 1 ok", "ERROR: order -2 invalid", "INFO: order 3 ok"]); });
