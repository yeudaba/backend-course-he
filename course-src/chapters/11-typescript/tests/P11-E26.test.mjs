import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe, code } from "./_ts.mjs";

const FILE = "P11-E26.ts";
const get = () => exportsOf(import.meta.url, FILE, ["toPublic", "applyPatch", "countRoles"]);
const dana = { id: 1, name: "דנה", email: "dana@x.com", passwordHash: "h1", role: "admin" };
const omer = { id: 2, name: "עומר", email: "omer@x.com", passwordHash: "h2", role: "member" };

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});

test("הטיפוסים: PublicUser, ‏UserPatch ו־RoleCounts", () => {
  const r = typeProbe(
    import.meta.url,
    FILE,
    `import type { User, PublicUser, UserPatch, RoleCounts } from "FILE";

const u: User = { id: 1, name: "a", email: "a@x", passwordHash: "h", role: "member" };
// PublicUser הוא User בלי passwordHash
const pub: PublicUser = { id: 1, name: "a", email: "a@x", role: "admin" };
// @ts-expect-error — ב־PublicUser אסור שיהיה passwordHash (Omit)
const leak: PublicUser = { id: 1, name: "a", email: "a@x", role: "admin", passwordHash: "h" };
// @ts-expect-error — role ב־User הוא רק "admin" או "member"
const badRole: User = { ...u, role: "owner" };

// UserPatch: name ו־email, שניהם אופציונליים
const empty: UserPatch = {};
const onlyName: UserPatch = { name: "b" };
const both: UserPatch = { name: "b", email: "b@x" };
// @ts-expect-error — אי אפשר לשנות role דרך patch (Pick)
const promote: UserPatch = { role: "admin" };
// @ts-expect-error — אי אפשר לשנות id דרך patch (Pick)
const moveId: UserPatch = { id: 7 };

// RoleCounts: מספר לכל role — שני המפתחות חובה
const counts: RoleCounts = { admin: 1, member: 2 };
// @ts-expect-error — חסר member (Record על כל ה־roles)
const partialCounts: RoleCounts = { admin: 1 };
// @ts-expect-error — "guest" אינו role
const extra: RoleCounts = { admin: 1, member: 2, guest: 3 };

export { u, pub, leak, badRole, empty, onlyName, both, promote, moveId, counts, partialCounts, extra };
`
  );
  assert.ok(r.ok, r.message);
});

test("משתמש ב־Omit, ‏Partial, ‏Pick ו־Record", () => {
  const src = code(import.meta.url, FILE);
  for (const name of ["Omit", "Partial", "Pick", "Record"]) {
    assert.match(src, new RegExp(`\\b${name}<`), `התרגיל מתרגל utility types — לא מצאתי ${name}<...>`);
  }
});

test("toPublic מסירה את passwordHash ולא משנה את המקור", async () => {
  const { toPublic } = await get();
  const copy = { ...dana };
  assert.deepEqual(toPublic(copy), { id: 1, name: "דנה", email: "dana@x.com", role: "admin" });
  assert.equal(copy.passwordHash, "h1", "toPublic מחקה את passwordHash מהאובייקט המקורי");
});

test("applyPatch מחזירה עותק מעודכן", async () => {
  const { applyPatch } = await get();
  const copy = { ...dana };
  assert.deepEqual(applyPatch(copy, { email: "new@x.com" }), { ...dana, email: "new@x.com" });
  assert.deepEqual(applyPatch(copy, {}), dana);
  assert.equal(copy.email, "dana@x.com", "applyPatch שינתה את האובייקט המקורי");
});

test("countRoles", async () => {
  const { countRoles } = await get();
  assert.deepEqual(countRoles([dana, omer, { ...omer, id: 3 }]), { admin: 1, member: 2 });
  assert.deepEqual(countRoles([]), { admin: 0, member: 0 }, "גם בלי משתמשים — שני המפתחות עם 0");
});
