import { test } from "node:test";
import assert from "node:assert/strict";
import { load, typecheck } from "../../tools/load.mjs";

const { toUserResponse, toUserResponses } = await load(import.meta.url, "P12-E18.ts");

test("עובר בדיקת טיפוסים (tsc --strict)", () => { const r = typecheck(import.meta.url, "P12-E18.ts"); assert.ok(r.ok, r.output); });
const rec = (id, del = false) => ({ id, email: `${id}@x.com`, first_name: "דנה", last_name: "כהן", password_hash: "SECRET", created_at: new Date("2026-03-05T12:00:00Z"), is_deleted: del });
test("toUserResponse", () => assert.deepEqual(toUserResponse(rec(1)), { id: 1, email: "1@x.com", displayName: "דנה כהן", memberSince: "2026-03-05" }));
test("אין סודות", () => assert.equal(JSON.stringify(toUserResponse(rec(1))).includes("SECRET"), false));
test("toUserResponses בלי מחוקים", () => assert.deepEqual(toUserResponses([rec(1), rec(2, true), rec(3)]).map((u) => u.id), [1, 3]));
