import { test } from "node:test";
import assert from "node:assert/strict";
import { readWorkflow, stepIndex } from "./_workflow.mjs";

const { wf } = readWorkflow(import.meta.url, "P25-E13.yml");
const job = Object.values(wf.jobs).find((j) => j.services);

test("שירות postgres", () => {
  assert.ok(job, "job עם services");
  const pg = Object.values(job.services)[0];
  assert.match(pg.image, /^postgres:18(-alpine)?$/, "postgres:18-alpine — אותה גרסה כמו בפרודקשן");
  assert.ok(pg.env?.POSTGRES_PASSWORD, "POSTGRES_PASSWORD (בלעדיו ה־image לא עולה)");
  assert.ok([pg.ports].flat().some((p) => String(p).startsWith("5432:5432")), "ports: 5432:5432 — הצעדים רצים על ה־runner, לא בקונטיינר");
  assert.match(String(pg.options), /--health-cmd\s+"?pg_isready/, "--health-cmd pg_isready: GitHub מחכה שהשירות healthy לפני הצעדים");
});
test("DATABASE_URL מצביע על השירות", () => {
  const url = job.env?.DATABASE_URL ?? job.steps.map((s) => s.env?.DATABASE_URL).find(Boolean);
  assert.ok(url, "DATABASE_URL ב־env של ה־job");
  const pg = Object.values(job.services)[0];
  const u = new URL(url);
  assert.equal(u.hostname, "localhost", "localhost — ה־runner מגיע לשירות דרך ה־port");
  assert.equal(u.port || "5432", "5432");
  assert.equal(decodeURIComponent(u.username), pg.env.POSTGRES_USER ?? "postgres");
  assert.equal(decodeURIComponent(u.password), pg.env.POSTGRES_PASSWORD);
  assert.equal(u.pathname.slice(1), pg.env.POSTGRES_DB ?? pg.env.POSTGRES_USER ?? "postgres", "אותו שם מסד");
});
test("סדר: install ← generate ← migrate ← בדיקות", () => {
  const idx = [/^npm ci$/, /prisma generate/, /prisma migrate deploy/, /test:int/].map((re) => stepIndex(job, re));
  idx.forEach((i, k) => assert.ok(i >= 0, `צעד ${k + 1} חסר`));
  assert.deepEqual([...idx].sort((a, b) => a - b), idx, "בסדר הזה");
  assert.equal(stepIndex(job, /migrate dev/), -1, "migrate deploy ולא migrate dev (dev יוצר migrations ושואל שאלות)");
});
