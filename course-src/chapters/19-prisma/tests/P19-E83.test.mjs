import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";
import { scenario, SEED } from "./_customers.mjs";

const FILE = "P19-E83.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["InMemoryCustomersRepository", "AppError"])).InMemoryCustomersRepository;
test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("התרחיש", async () => {
  const Repo = await get();
  const out = Object.fromEntries(await scenario(new Repo(SEED)));
  assert.deepEqual(out["findById(1)"], SEED[0]);
  assert.equal(out["findById(99)"], undefined);
  assert.deepEqual(out["findByEmail(Dana@Example.com)"], SEED[0], "בלי הבדל אותיות");
  assert.equal(out["findByEmail(nobody)"], undefined);
  assert.deepEqual(out["insert(tal)"], { id: 9, fullName: "Tal Gil", email: "tal@example.com", city: "Eilat" });
  assert.deepEqual(out["insert(tal again)"], { error: "EMAIL_TAKEN" });
  assert.deepEqual(out["insert(lior)"], { id: 10, fullName: "Lior", email: "lior@example.com", city: null });
  assert.deepEqual(out["findByEmail(TAL@EXAMPLE.COM)"], { id: 9, fullName: "Tal Gil", email: "tal@example.com", city: "Eilat" });
  assert.equal(out["delete(lior)"], true);
  assert.equal(out["delete(lior) again"], false);
  assert.equal(out["findById(lior)"], undefined);
});
test("עותקים, ו־constructor ריק", async () => {
  const Repo = await get();
  const seed = [{ ...SEED[0] }];
  const repo = new Repo(seed);
  seed[0].fullName = "changed outside";
  const a = await repo.findById(1);
  assert.equal(a.fullName, "Dana Levi", "ה־repository שומר עותק של מה שקיבל");
  a.fullName = "hacked";
  assert.equal((await repo.findById(1)).fullName, "Dana Levi", "שינוי באובייקט שחזר לא משנה את מה ששמור");
  const ins = await repo.insert({ fullName: "X", email: "x@x.com", city: null });
  ins.email = "y@y.com";
  assert.equal((await repo.findById(2)).email, "x@x.com");
  const empty = new Repo();
  assert.deepEqual(await empty.insert({ fullName: "A", email: "a@a", city: null }), { id: 1, fullName: "A", email: "a@a", city: null });
  assert.ok((await empty.findById(1)) !== undefined);
});
