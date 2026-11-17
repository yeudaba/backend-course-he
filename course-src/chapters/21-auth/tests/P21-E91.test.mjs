import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P21-E91.ts", ["UsersRepository"])).UsersRepository;
class PrismaError extends Error {
  constructor(code, message) { super(message); this.code = code; }
}
// Prisma מזויף: create אסינכרוני באמת (נדחה אחרי tick), כמו Prisma
function fakePrisma() {
  const rows = [];
  let next = 1;
  return {
    rows,
    failNext: null,
    user: {
      create: async ({ data }) => {
        await new Promise((r) => setTimeout(r, 5));
        if (fake.failNext) { const e = fake.failNext; fake.failNext = null; throw e; }
        if (rows.some((r) => r.email === data.email)) throw new PrismaError("P2002", "Unique constraint failed on the fields: (`email`)");
        const row = { id: next++, ...data };
        rows.push(row);
        return row;
      },
      findUnique: async ({ where }) => rows.find((r) => r.email === where.email) ?? null,
    },
  };
}
let fake;

test("insert ו־findByEmail", async () => {
  const UsersRepository = await get();
  fake = fakePrisma();
  const repo = new UsersRepository(fake);
  const data = { email: "dana@example.com", passwordHash: "$2b$04$x", role: "user" };
  assert.deepEqual(await repo.insert(data), { id: 1, ...data });
  assert.equal(await repo.insert({ ...data, passwordHash: "other" }), undefined, "P2002 ← undefined");
  assert.equal(fake.rows.length, 1);
  assert.deepEqual(await repo.findByEmail("dana@example.com"), { id: 1, ...data });
  assert.equal(await repo.findByEmail("nobody@example.com"), undefined, "null ← undefined");
});
test("שגיאות אחרות — עולות כמו שהן", async () => {
  const UsersRepository = await get();
  fake = fakePrisma();
  const repo = new UsersRepository(fake);
  const boom = new PrismaError("P1001", "Can't reach database server");
  fake.failNext = boom;
  await assert.rejects(repo.insert({ email: "a@b.co", passwordHash: "h", role: "user" }), (e) => e === boom, "אותה שגיאה בדיוק");
  const plain = new Error("connection reset");
  fake.failNext = plain;
  await assert.rejects(repo.insert({ email: "a@b.co", passwordHash: "h", role: "user" }), (e) => e === plain);
  assert.deepEqual(await repo.insert({ email: "a@b.co", passwordHash: "h", role: "user" }), { id: 1, email: "a@b.co", passwordHash: "h", role: "user" });
});
