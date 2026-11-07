import { test } from "node:test";
import assert from "node:assert/strict";
import { load, typecheck } from "../../tools/load.mjs";

const { isUser, parseUsers } = await load(import.meta.url, "P11-E18.ts");

test("עובר בדיקת טיפוסים (tsc --strict)", () => { const r = typecheck(import.meta.url, "P11-E18.ts"); assert.ok(r.ok, r.output); });
test("isUser", () => {
  assert.equal(isUser({ id: 1, email: "a@b.c", roles: ["admin"] }), true);
  for (const bad of [null, [], { id: "1", email: "x", roles: [] }, { id: 1, email: "x" }, { id: 1, email: "x", roles: [1] }]) assert.equal(isUser(bad), false);
});
test("parseUsers", () => {
  assert.deepEqual(parseUsers('[{"id":1,"email":"a@b.c","roles":["admin"]},{"id":"2"}]'), { users: [{ id: 1, email: "a@b.c", roles: ["admin"] }], invalid: 1 });
  assert.throws(() => parseUsers("{oops"), { message: "הקלט אינו מערך JSON" });
  assert.throws(() => parseUsers('{"a":1}'), { message: "הקלט אינו מערך JSON" });
});
