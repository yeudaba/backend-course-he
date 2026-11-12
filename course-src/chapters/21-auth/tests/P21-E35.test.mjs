import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe } from "./_ts.mjs";

const FILE = "P21-E35.ts";
const dana = () => ({ id: 1, email: "dana@example.com", passwordHash: "$2b$04$abcdefghijklmnopqrstuuabcdefghijklmnopqrstuvwxyz12345", role: "user", createdAt: "2026-11-05T10:00:00.000Z" });

test("טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
  const p = typeProbe(import.meta.url, FILE, `import { toPublicUser, type User, type PublicUser } from "FILE";
const u: User = { id: 1, email: "a@b.co", passwordHash: "x", role: "admin", createdAt: "" };
const p: PublicUser = toPublicUser(u);
// @ts-expect-error — ב־PublicUser אין passwordHash
p.passwordHash;
`);
  assert.ok(p.ok, p.message);
});
test("toPublicUser", async () => {
  const { toPublicUser } = await exportsOf(import.meta.url, FILE, ["toPublicUser"]);
  const u = dana();
  const out = toPublicUser(u);
  assert.deepEqual(out, { id: 1, email: "dana@example.com", role: "user", createdAt: "2026-11-05T10:00:00.000Z" });
  assert.deepEqual(u, dana(), "המשתמש המקורי לא השתנה");
  assert.notEqual(out, u, "אובייקט חדש");
  const extra = { ...dana(), id: 9, role: "admin", resetToken: "abc123", mfaSecret: "JBSWY3DP" };
  assert.deepEqual(toPublicUser(extra), { id: 9, email: "dana@example.com", role: "admin", createdAt: "2026-11-05T10:00:00.000Z" }, "שדות שלא ב־PublicUser לא יוצאים — רשימה מפורשת, לא rest");
});
test("toPublicUsers", async () => {
  const { toPublicUsers } = await exportsOf(import.meta.url, FILE, ["toPublicUsers"]);
  assert.deepEqual(toPublicUsers([]), []);
  const list = [dana(), { ...dana(), id: 2, email: "yossi@example.com" }];
  const out = toPublicUsers(list);
  assert.deepEqual(out.map((u) => u.id), [1, 2]);
  assert.ok(out.every((u) => !("passwordHash" in u)), "אין passwordHash באף אחד");
  assert.ok("passwordHash" in list[0], "המערך המקורי לא השתנה");
});
