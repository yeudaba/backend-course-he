import { test } from "node:test";
import assert from "node:assert/strict";
import { load, typecheck } from "../../tools/load.mjs";

const { CachedRepository } = await load(import.meta.url, "P12-E17.ts");

test("עובר בדיקת טיפוסים (tsc --strict)", () => { const r = typecheck(import.meta.url, "P12-E17.ts"); assert.ok(r.ok, r.output); });
function fakeRepo() { const calls = []; const data = new Map([[1, { id: 1, v: "a" }]]); return { calls, repo: { findById: async (id) => { calls.push(id); return data.has(id) ? { ...data.get(id) } : null; }, save: async (x) => { data.set(x.id, { ...x }); } } }; }
test("hits ו־misses, גם null נשמר", async () => { const { calls, repo } = fakeRepo(); const c = new CachedRepository(repo); await c.findById(1); await c.findById(1); await c.findById(2); await c.findById(2); assert.equal(c.hits, 2); assert.equal(c.misses, 2); assert.deepEqual(calls, [1, 2]); });
test("save מעדכן cache", async () => { const { repo } = fakeRepo(); const c = new CachedRepository(repo); await c.findById(1); await c.save({ id: 1, v: "new" }); assert.equal((await c.findById(1)).v, "new"); });
test("מחזיר עותקים", async () => { const { repo } = fakeRepo(); const c = new CachedRepository(repo); (await c.findById(1)).v = "x"; assert.equal((await c.findById(1)).v, "a"); });
