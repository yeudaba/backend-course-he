import { test } from "node:test";
import assert from "node:assert/strict";
import { load, typecheck } from "../../tools/load.mjs";

const { InMemoryRepository } = await load(import.meta.url, "P12-E11.ts");

test("עובר בדיקת טיפוסים (tsc --strict)", () => { const r = typecheck(import.meta.url, "P12-E11.ts"); assert.ok(r.ok, r.output); });
test("save, findAll ממוין, count", async () => { const r = new InMemoryRepository(); await r.save({ id: 2, n: "b" }); await r.save({ id: 1, n: "a" }); assert.deepEqual(await r.findAll(), [{ id: 1, n: "a" }, { id: 2, n: "b" }]); assert.equal(await r.count(), 2); });
test("findById ו־delete", async () => { const r = new InMemoryRepository(); await r.save({ id: 1, n: "a" }); assert.deepEqual(await r.findById(1), { id: 1, n: "a" }); assert.equal(await r.findById(9), null); assert.equal(await r.delete(1), true); assert.equal(await r.delete(1), false); });
test("עותקים בכניסה וביציאה", async () => { const r = new InMemoryRepository(); const x = { id: 1, n: "a" }; await r.save(x); x.n = "changed"; const y = await r.findById(1); y.n = "also"; assert.equal((await r.findById(1)).n, "a"); });
test("save מחליף", async () => { const r = new InMemoryRepository(); await r.save({ id: 1, n: "a" }); await r.save({ id: 1, n: "b" }); assert.equal((await r.findById(1)).n, "b"); assert.equal(await r.count(), 1); });
