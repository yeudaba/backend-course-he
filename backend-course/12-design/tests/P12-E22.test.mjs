import { test } from "node:test";
import assert from "node:assert/strict";
import { load, typecheck } from "../../tools/load.mjs";

const { MemoryProductRepo, PricingService } = await load(import.meta.url, "P12-E22.ts");

test("עובר בדיקת טיפוסים (tsc --strict)", () => { const r = typecheck(import.meta.url, "P12-E22.ts"); assert.ok(r.ok, r.output); });
test("repository לא דולף", async () => { const r = new MemoryProductRepo(); const p = { id: 1, price: 100 }; await r.save(p); p.price = 5; const got = await r.findById(1); got.price = 1; assert.equal((await r.findById(1)).price, 100); });
test("service מקבל repository מבחוץ", async () => { const fake = { findById: async (id) => ({ id, price: 50 }), save: async () => {} }; assert.equal(await new PricingService(fake).priceWithVat(1), 59); });
