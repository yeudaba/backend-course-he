import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const url = process.env.COURSE_DATABASE_URL || "postgresql://localhost:5432/course";

test("P19-E34: client עובד, ב־UTC", async (t) => {
  const { createPrisma } = await exportsOf(import.meta.url, "P19-E34.ts", ["createPrisma"]);
  const prisma = createPrisma(url);
  t.after(() => prisma.$disconnect());
  assert.equal(typeof prisma.product?.findMany, "function", "createPrisma צריכה להחזיר PrismaClient של הפרק");
  const [{ tz }] = await prisma.$queryRaw`SELECT current_setting('TimeZone') AS tz`;
  assert.equal(tz, "UTC", "החיבור צריך לעבוד ב־UTC (options: \"-c timezone=UTC\")");
  const [{ t: when }] = await prisma.$queryRaw`SELECT timestamptz '2026-03-28 21:10:00+03' AS t`;
  assert.equal(when.toISOString(), "2026-03-28T18:10:00.000Z", "הזמן נקרא נכון");
  const other = createPrisma(url);
  t.after(() => other.$disconnect());
  assert.notEqual(other, prisma, "כל קריאה — client חדש");
});
