import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { readSource } = await load(import.meta.url, "P28-E82.ts");
const CATALOG = { kind: "stale-ok", maxStaleMs: 60_000, cacheable: true };
const STATUS = { kind: "stale-ok", maxStaleMs: 5_000, cacheable: false };
const STOCK = { kind: "strong" };
const ctx = (over = {}) => ({ lastWriteAt: null, now: 1_000_000, inTransaction: false, ...over });

test("strong ו־טרנזקציה ← primary", () => {
  assert.equal(readSource(STOCK, ctx()), "primary");
  assert.equal(readSource(CATALOG, ctx({ inTransaction: true })), "primary");
  assert.equal(readSource(STATUS, ctx({ inTransaction: true })), "primary");
});
test("stale-ok", () => {
  assert.equal(readSource(CATALOG, ctx()), "cache");
  assert.equal(readSource(STATUS, ctx()), "replica");
  assert.equal(readSource(STATUS, ctx({ lastWriteAt: 996_000 })), "primary", "כתב לפני 4 שניות");
  assert.equal(readSource(STATUS, ctx({ lastWriteAt: 995_000 })), "replica", "בדיוק 5 שניות — כבר לא");
  assert.equal(readSource(CATALOG, ctx({ lastWriteAt: 999_999 })), "primary");
  assert.equal(readSource(CATALOG, ctx({ lastWriteAt: 900_000 })), "cache");
  assert.equal(readSource({ kind: "stale-ok", maxStaleMs: 0, cacheable: true }, ctx({ lastWriteAt: 1_000_000 })), "cache");
});
test("maxStaleMs שלילי", () => {
  assert.throws(() => readSource({ kind: "stale-ok", maxStaleMs: -1, cacheable: true }, ctx()), RangeError);
});
