import { test } from "node:test";
import assert from "node:assert/strict";
import { ObjectId } from "mongodb";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25.7-E38.ts", ["toApi"])).toApi;

test("המרות בכל עומק", async () => {
  const f = await get();
  const id = new ObjectId("6af1a8c0e4b0f1a2b3c4d5e6");
  const owner = new ObjectId("6af1a8c0e4b0f1a2b3c4d5e7");
  const at = new Date("2026-11-04T22:30:00Z");
  const doc = { _id: id, ownerId: owner, createdAt: at, items: [{ _id: "x", at, n: 1 }, null, [owner]], meta: { ok: true, n: null }, s: "str" };
  assert.deepEqual(f(doc), {
    id: "6af1a8c0e4b0f1a2b3c4d5e6", ownerId: "6af1a8c0e4b0f1a2b3c4d5e7", createdAt: "2026-11-04T22:30:00.000Z",
    items: [{ id: "x", at: "2026-11-04T22:30:00.000Z", n: 1 }, null, ["6af1a8c0e4b0f1a2b3c4d5e7"]], meta: { ok: true, n: null }, s: "str",
  });
  assert.ok(doc._id instanceof ObjectId && doc.createdAt instanceof Date, "הקלט לא השתנה");
  assert.equal(f(7), 7);
  assert.equal(f(null), null);
  assert.equal(f(id), "6af1a8c0e4b0f1a2b3c4d5e6");
});
