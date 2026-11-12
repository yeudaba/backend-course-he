import { test } from "node:test";
import assert from "node:assert/strict";
import { listen, api } from "../../tools/load.mjs";
import { exportsOf } from "./_ts.mjs";
import { shop } from "./_shop.mjs";
import { SEED } from "./_customers.mjs";

const FILE = "P19-E88.ts";
const taken = () => Object.assign(new Error("EMAIL_TAKEN"), { code: "EMAIL_TAKEN" });
class Memory {
  constructor(rows) { this.rows = rows.map((r) => ({ ...r })); }
  async findById(id) { const c = this.rows.find((r) => r.id === id); return c ? { ...c } : undefined; }
  async findByEmail(e) { return this.rows.find((r) => r.email === e); }
  async insert(d) { if (await this.findByEmail(d.email)) throw taken(); const c = { id: Math.max(0, ...this.rows.map((r) => r.id)) + 1, ...d }; this.rows.push(c); return { ...c }; }
  async delete(id) { const n = this.rows.length; this.rows = this.rows.filter((r) => r.id !== id); return this.rows.length < n; }
}
const SEL = { id: true, fullName: true, email: true, city: true };
const viaPrisma = (prisma) => ({
  findById: async (id) => (await prisma.customer.findUnique({ where: { id }, select: SEL })) ?? undefined,
  findByEmail: async (email) => (await prisma.customer.findUnique({ where: { email }, select: SEL })) ?? undefined,
  insert: async (d) => {
    try { return await prisma.customer.create({ data: { ...d, joinedOn: new Date("2026-01-01T00:00:00Z") }, select: SEL }); } catch (e) { if (e.code === "P2002") throw taken(); throw e; }
  },
  delete: async (id) => (await prisma.customer.deleteMany({ where: { id } })).count === 1,
});

async function run(t, repo) {
  const { createApp } = await exportsOf(import.meta.url, FILE, ["createApp"]);
  const { base, close } = await listen(createApp(repo));
  t.after(close);
  const call = api(base);
  const one = await call("GET", "/customers/1");
  assert.equal(one.status, 200);
  assert.deepEqual(one.body, SEED[0]);
  assert.deepEqual((await call("GET", "/customers/99")).status, 404);
  assert.deepEqual((await call("GET", "/customers/99")).body, { error: "NOT_FOUND" });
  for (const bad of ["abc", "0", "-1", "1.5"]) assert.deepEqual((await call("GET", `/customers/${bad}`)).status, 400, bad);
  const created = await call("POST", "/customers", { fullName: "  Tal Gil ", email: "TAL@Example.com" });
  assert.equal(created.status, 201);
  assert.deepEqual(created.body, { id: 9, fullName: "Tal Gil", email: "tal@example.com", city: null });
  const dup = await call("POST", "/customers", { fullName: "Tal 3", email: "Tal@example.com" });
  assert.equal(dup.status, 409);
  assert.deepEqual(dup.body, { error: "EMAIL_TAKEN" });
  for (const body of [{}, { fullName: " ", email: "a@b.co" }, { fullName: "a", email: "nope" }, { fullName: "a", email: "a@b.co", city: 5 }]) {
    const r = await call("POST", "/customers", body);
    assert.equal(r.status, 400, JSON.stringify(body));
    assert.deepEqual(r.body, { error: "VALIDATION" });
  }
  const del = await call("DELETE", "/customers/8");
  assert.equal(del.status, 204);
  assert.equal(del.body, undefined);
  assert.equal((await call("DELETE", "/customers/8")).status, 404);
  assert.equal((await call("GET", "/customers/8")).status, 404);
}

test("עם repository בזיכרון", async (t) => {
  await run(t, new Memory(SEED));
});
test("עם repository מעל PostgreSQL", async (t) => {
  const { prisma } = await shop(t, import.meta.url);
  await run(t, viaPrisma(prisma));
});
