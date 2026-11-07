import { test } from "node:test";
import assert from "node:assert/strict";
import { load, typecheck } from "../../tools/load.mjs";

const { updateProfile } = await load(import.meta.url, "P12-E23.ts");

test("עובר בדיקת טיפוסים (tsc --strict)", () => { const r = typecheck(import.meta.url, "P12-E23.ts"); assert.ok(r.ok, r.output); });
const u = () => ({ id: 1, name: "a", bio: "", role: "user" });
test("לא ניתן לשנות role", () => assert.deepEqual(updateProfile(u(), { name: "דנה", role: "admin", id: 99 }), { id: 1, name: "דנה", bio: "", role: "user" }));
test("bio", () => assert.equal(updateProfile(u(), { bio: "שלום" }).bio, "שלום"));
test("שגיאות", () => {
  assert.throws(() => updateProfile(u(), { name: "" }), { message: "שדה לא תקין: name" });
  assert.throws(() => updateProfile(u(), { name: "x".repeat(51) }), { message: "שדה לא תקין: name" });
  assert.throws(() => updateProfile(u(), { bio: 5 }), { message: "שדה לא תקין: bio" });
  assert.throws(() => updateProfile(u(), "x"), { message: "שדה לא תקין: body" });
});
