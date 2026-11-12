import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { chooseStatus } = await load(import.meta.url, "P27-E92.ts");
const ok = { authenticated: true, exists: true, owned: true, allowed: true, valid: true, conflict: false, rateLimited: false };

test("כל מצב, והסדר ביניהם", () => {
  assert.equal(chooseStatus(ok), 200);
  assert.equal(chooseStatus({ ...ok, created: true }), 201);
  assert.equal(chooseStatus({ ...ok, conflict: true }), 409);
  assert.equal(chooseStatus({ ...ok, valid: false, conflict: true }), 422);
  assert.equal(chooseStatus({ ...ok, allowed: false, valid: false }), 403);
  assert.equal(chooseStatus({ ...ok, owned: false, allowed: false }), 404, "404 לפני 403");
  assert.equal(chooseStatus({ ...ok, exists: false }), 404);
  assert.equal(chooseStatus({ ...ok, authenticated: false, exists: false }), 401);
  assert.equal(chooseStatus({ ...ok, rateLimited: true, authenticated: false }), 429);
});
