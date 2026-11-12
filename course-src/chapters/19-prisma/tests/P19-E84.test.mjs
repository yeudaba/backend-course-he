import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";
import { shop } from "./_shop.mjs";
import { scenario, SEED } from "./_customers.mjs";

const FILE = "P19-E84.ts";
// מימוש בזיכרון של הבודק — "התשובות הנכונות" לתרחיש
class Reference {
  constructor(rows) { this.rows = rows.map((r) => ({ ...r })); }
  async findById(id) { const c = this.rows.find((r) => r.id === id); return c ? { ...c } : undefined; }
  async findByEmail(e) { const c = this.rows.find((r) => r.email.toLowerCase() === e.toLowerCase()); return c ? { ...c } : undefined; }
  async insert(d) { if (await this.findByEmail(d.email)) throw Object.assign(new Error("x"), { code: "EMAIL_TAKEN" }); const c = { id: Math.max(0, ...this.rows.map((r) => r.id)) + 1, ...d }; this.rows.push(c); return { ...c }; }
  async delete(id) { const n = this.rows.length; this.rows = this.rows.filter((r) => r.id !== id); return this.rows.length < n; }
}

test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("אותו תרחיש — אותן תוצאות כמו בזיכרון", async (t) => {
  const { PrismaCustomersRepository } = await exportsOf(import.meta.url, FILE, ["PrismaCustomersRepository"]);
  const { prisma } = await shop(t, import.meta.url);
  const mine = await scenario(new PrismaCustomersRepository(prisma));
  const expected = await scenario(new Reference(SEED));
  // ה־INSERT שנכשל (אימייל תפוס) "שורף" מספר במסד (P18-E32) — אז ל־Lior מותר id גדול מ־9, לא בדיוק 10
  const lior = mine.find(([name]) => name === "insert(lior)")[1];
  assert.ok(Number.isInteger(lior?.id) && lior.id > 9, `insert(lior) — id חדש: ${JSON.stringify(lior)}`);
  lior.id = 10;
  for (let i = 0; i < expected.length; i++) assert.deepEqual(mine[i], expected[i], expected[i][0]);
  const tal = await prisma.customer.findUniqueOrThrow({ where: { email: "tal@example.com" } });
  assert.equal(tal.joinedOn.toISOString(), new Date().toISOString().slice(0, 10) + "T00:00:00.000Z", "joinedOn — היום, בחצות UTC");
});
test("delete של לקוח עם הזמנות — לא false", async (t) => {
  const { PrismaCustomersRepository } = await exportsOf(import.meta.url, FILE, ["PrismaCustomersRepository"]);
  const { prisma } = await shop(t, import.meta.url);
  await assert.rejects(new PrismaCustomersRepository(prisma).delete(1), undefined, "P2003 הוא לא 'לא נמצא' — נזרק");
});
