import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe } from "./_ts.mjs";

const FILE = "P12-E61.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["InMemoryUserRepository"])).InMemoryUserRepository;

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("החוזה UserRepository", () => {
  const r = typeProbe(import.meta.url, FILE, `import { InMemoryUserRepository } from "FILE";
import type { UserRepository, User } from "FILE";
const repo: UserRepository = new InMemoryUserRepository();
async function f() {
  const u: User | null = await repo.findByEmail("x");
  const ok: boolean = await repo.delete(1);
  // @ts-expect-error — findById מחזירה Promise (צריך await)
  const sync: User | null = repo.findById(1);
  return [u, ok, sync];
}
export { f };
`);
  assert.ok(r.ok, r.message);
});
test("save, findById, findByEmail", async () => {
  const Repo = await get();
  const repo = new Repo();
  await repo.save({ id: 1, email: "Dana@Mail.com", name: "דנה" });
  await repo.save({ id: 2, email: "omer@mail.com", name: "עומר" });
  assert.deepEqual(await repo.findById(1), { id: 1, email: "Dana@Mail.com", name: "דנה" });
  assert.equal(await repo.findById(3), null);
  assert.equal((await repo.findByEmail("  dana@mail.COM "))?.id, 1);
  assert.equal((await repo.findByEmail("OMER@mail.com"))?.name, "עומר");
  assert.equal(await repo.findByEmail("nobody@mail.com"), null);
  await repo.save({ id: 1, email: "dana@new.com", name: "דנה" });
  assert.equal((await repo.findById(1))?.email, "dana@new.com", "save עם id קיים מחליפה");
  assert.equal(await repo.findByEmail("dana@mail.com"), null);
});
test("delete", async () => {
  const Repo = await get();
  const repo = new Repo();
  await repo.save({ id: 5, email: "a@b.c", name: "a" });
  assert.equal(await repo.delete(5), true);
  assert.equal(await repo.delete(5), false);
  assert.equal(await repo.findById(5), null);
});
test("עותקים בשמירה ובשליפה", async () => {
  const Repo = await get();
  const repo = new Repo();
  const u = { id: 1, email: "a@b.c", name: "a" };
  await repo.save(u);
  u.name = "שונה בחוץ";
  const found = await repo.findById(1);
  assert.equal(found?.name, "a", "save צריכה לשמור עותק");
  found.name = "שונה אחרי שליפה";
  (await repo.findByEmail("a@b.c")).name = "גם כאן";
  assert.equal((await repo.findById(1))?.name, "a", "findById/findByEmail צריכות להחזיר עותק");
});
