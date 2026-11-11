import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe } from "./_ts.mjs";

const FILE = "P12-E80.ts";
const get = () => exportsOf(import.meta.url, FILE, ["ValidationError", "ConflictError", "parseSignup", "SignupService"]);

function fakeRepo(existing = []) {
  const rows = existing.map((u) => ({ ...u }));
  const inserts = [];
  return {
    rows,
    inserts,
    repo: {
      async findByEmail(email) {
        const u = rows.find((x) => x.email === email);
        return u ? { ...u } : null;
      },
      async insert(u) {
        inserts.push({ ...u });
        const user = { ...u, id: 100 + rows.length };
        rows.push(user);
        return { ...user };
      },
    },
  };
}
const good = { email: " Dana@Mail.com ", name: " דנה ", password: "12345678" };

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("הטיפוסים", () => {
  const r = typeProbe(import.meta.url, FILE, `import { SignupService, parseSignup } from "FILE";
import type { UserRepository, User } from "FILE";
const repo: UserRepository = {
  async findByEmail(email: string) { return null; },
  async insert(u: Omit<User, "id">) { return { ...u, id: 1 }; },
};
const s = new SignupService(repo, (p: string) => p);
async function f() {
  const r = await s.signup({});
  const id: number = r.id;
  // @ts-expect-error — התשובה לא מכילה passwordHash
  r.passwordHash;
  return id;
}
const dto: { email: string; name: string; password: string } = parseSignup({});
export { f, dto };
`);
  assert.ok(r.ok, r.message);
});
test("parseSignup — נרמול ובלי שדות מיותרים", async () => {
  const { parseSignup } = await get();
  assert.deepEqual(parseSignup({ ...good, isAdmin: true }), { email: "dana@mail.com", name: "דנה", password: "12345678" });
});
test("parseSignup — שגיאות", async () => {
  const { parseSignup, ValidationError } = await get();
  const cases = [
    [null, "body"],
    [[], "body"],
    [{ ...good, email: "a@b" }, "email"],
    [{ ...good, email: "a b@c.d" }, "email"],
    [{ ...good, email: 5 }, "email"],
    [{ name: "x", password: "12345678" }, "email"],
    [{ ...good, name: "  " }, "name"],
    [{ ...good, password: "1234567" }, "password"],
    [{ ...good, password: 12345678 }, "password"],
  ];
  for (const [input, field] of cases) {
    assert.throws(() => parseSignup(input), (e) => e instanceof ValidationError && e.field === field && e.message === `${field} לא תקין` && e.name === "ValidationError", `${JSON.stringify(input)} ← ${field}`);
  }
});
test("signup — hash, ותשובה בלי hash", async () => {
  const { SignupService } = await get();
  const { repo, inserts } = fakeRepo();
  const s = new SignupService(repo, (p) => `h:${p}`);
  const r = await s.signup({ ...good, isAdmin: true });
  assert.deepEqual(r, { id: 100, email: "dana@mail.com", name: "דנה" });
  assert.deepEqual(inserts, [{ email: "dana@mail.com", name: "דנה", passwordHash: "h:12345678" }], "insert צריכה לקבל רק email, name, passwordHash — עם hash, לא הסיסמה");
});
test("signup — אימייל קיים (אחרי נרמול) ← ConflictError, בלי insert", async () => {
  const { SignupService, ConflictError, ValidationError } = await get();
  const { repo, inserts } = fakeRepo([{ id: 1, email: "dana@mail.com", name: "דנה", passwordHash: "x" }]);
  const s = new SignupService(repo, (p) => p);
  await assert.rejects(s.signup(good), (e) => e instanceof ConflictError && e.message === "האימייל כבר רשום" && e.name === "ConflictError");
  await assert.rejects(s.signup({ ...good, email: "bad" }), ValidationError);
  assert.equal(inserts.length, 0);
});
