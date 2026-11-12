import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25-E35.ts", ["summarizeLog"])).summarizeLog;
const ts = (s) => `2026-11-07T15:40:${String(s).padStart(2, "0")}.1234567Z `;

test("typecheck שנכשל", async () => {
  const f = await get();
  const log = [
    ts(1) + "##[group]Run actions/checkout@v5",
    ts(2) + "##[endgroup]",
    ts(3) + "##[group]Run npm ci",
    ts(4) + "added 653 packages",
    ts(5) + "##[endgroup]",
    ts(6) + "##[group]Run npm run typecheck",
    ts(7) + "npm run typecheck",
    ts(8) + "##[endgroup]",
    ts(9) + "##[error]src/auth/auth.schema.spec.ts(3,1): error TS2593: Cannot find name 'describe'.",
    ts(10) + "##[error]prisma/seed.ts(16,1): error TS1309: The current file is a CommonJS module.",
    ts(11) + "##[error]Process completed with exit code 2.",
  ].join("\n");
  assert.deepEqual(f(log), {
    failedStep: "npm run typecheck",
    firstError: "src/auth/auth.schema.spec.ts(3,1): error TS2593: Cannot find name 'describe'.",
    errorCount: 2,
    exitCode: 2,
  });
});
test("בלי prefix של זמן; רק exit code", async () => {
  const f = await get();
  const log = "##[group]Run npm test\n> jest\nTests: 1 failed\n##[error]Process completed with exit code 1.\n##[error]Process completed with exit code 3.";
  assert.deepEqual(f(log), { failedStep: null, firstError: null, errorCount: 0, exitCode: 1 });
});
test("שגיאה לפני כל צעד, וריצה ירוקה", async () => {
  const f = await get();
  assert.deepEqual(f("##[error]Unable to resolve action actions/chekout@v5\n##[group]Run x"), {
    failedStep: null, firstError: "Unable to resolve action actions/chekout@v5", errorCount: 1, exitCode: null,
  });
  assert.deepEqual(f(ts(1) + "##[group]Run npm test\n" + ts(2) + "ok\n" + ts(3) + "##[endgroup]"), { failedStep: null, firstError: null, errorCount: 0, exitCode: null });
});
test("השגיאה הראשונה — בצעד שלה, גם אם יש אחרות אחר כך", async () => {
  const f = await get();
  const log = ["##[group]Run npm run lint", "##[error]a.ts: no-unused-vars", "##[endgroup]", "##[group]Run npm test", "##[error]boom"].join("\n");
  const r = f(log);
  assert.equal(r.failedStep, "npm run lint");
  assert.equal(r.firstError, "a.ts: no-unused-vars");
  assert.equal(r.errorCount, 2);
});
