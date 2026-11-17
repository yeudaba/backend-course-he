import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { exportsOf, typecheck } from "./_ts.mjs";
import { shop } from "./_shop.mjs";

const FILE = "P19-E63.ts";
const get = () => exportsOf(import.meta.url, FILE, ["toApiCustomer", "toCustomerData"]);

test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("המרות", async () => {
  const { toApiCustomer, toCustomerData } = await get();
  const c = { id: 3, fullName: "Noa", email: "noa@x", city: null, joinedOn: new Date("2026-01-08T00:00:00Z") };
  assert.deepEqual(toApiCustomer(c), { id: 3, fullName: "Noa", email: "noa@x", city: null, joinedOn: "2026-01-08" });
  const d = toCustomerData({ fullName: "Lior", email: "  Lior@Example.COM ", joinedOn: "2024-02-29" });
  assert.deepEqual(d, { fullName: "Lior", email: "lior@example.com", city: null, joinedOn: new Date("2024-02-29T00:00:00Z") });
  assert.equal(toCustomerData({ fullName: "a", email: "a@b", city: "Haifa", joinedOn: "2026-12-31" }).city, "Haifa");
  for (const bad of ["2026-02-30", "2025-02-29", "2026-13-01", "26-01-01", "2026-1-5", "", "2026-01-05T10:00:00Z", "yesterday"]) {
    assert.throws(() => toCustomerData({ fullName: "a", email: "a@b", joinedOn: bad }), { message: "תאריך לא תקין" }, bad);
  }
});
test("הלוך־חזור דרך Prisma", async (t) => {
  const { toApiCustomer, toCustomerData } = await get();
  const { prisma } = await shop(t, import.meta.url);
  const saved = await prisma.customer.create({ data: toCustomerData({ fullName: "Tal", email: "TAL@x.com", city: "Eilat", joinedOn: "2026-05-10" }) });
  const read = await prisma.customer.findUniqueOrThrow({ where: { id: saved.id } });
  assert.deepEqual(toApiCustomer(read), { id: 9, fullName: "Tal", email: "tal@x.com", city: "Eilat", joinedOn: "2026-05-10" });
  const dana = await prisma.customer.findUniqueOrThrow({ where: { id: 1 } });
  assert.equal(toApiCustomer(dana).joinedOn, "2025-11-02");
});
test("אזור זמן אחר בתהליך", async () => {
  const script = `const m = await import(${JSON.stringify(new URL("../" + (process.env.CHECK_TARGET || "starter") + "/" + FILE, import.meta.url).href)});
const c = m.toApiCustomer({ id: 1, fullName: "a", email: "a", city: null, joinedOn: new Date("2025-11-02T00:00:00Z") });
const d = m.toCustomerData({ fullName: "a", email: "a", joinedOn: "2025-11-02" });
console.log(c.joinedOn, d.joinedOn.toISOString());`;
  const r = spawnSync(process.execPath, ["--experimental-strip-types", "--no-warnings", "--input-type=module", "-e", script], { encoding: "utf8", env: { ...process.env, TZ: "America/Los_Angeles" } });
  assert.equal(r.stdout.trim(), "2025-11-02 2025-11-02T00:00:00.000Z", `ב־America/Los_Angeles התאריך זז: ${r.stdout}${r.stderr}`);
});
