import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25-E49.ts", ["envDrift"])).envDrift;

test("missing ו־unused", async () => {
  const f = await get();
  const example = ["# הגדרות", "", "DATABASE_URL=postgresql://postgres@localhost:5432/dev", "export JWT_SECRET=change-me", "  OLD_FLAG=1", "PORT=3000", "# COMMENTED=1"].join("\n");
  const code = `
    const url = process.env.DATABASE_URL;
    const s = process.env["JWT_SECRET"];
    const c = process.env['CORS_ORIGINS'] ?? "";
    const p = Number(process.env.PORT ?? 3000);
    if (process.env.TRUST_PROXY) {}
    const again = process.env.CORS_ORIGINS;
  `;
  assert.deepEqual(f(example, code), { missing: ["CORS_ORIGINS", "TRUST_PROXY"], unused: ["OLD_FLAG"] });
});
test("ריק, ושמות לא רלוונטיים", async () => {
  const f = await get();
  assert.deepEqual(f("", ""), { missing: [], unused: [] });
  assert.deepEqual(f("A=1", "process.env.toString(); process.env.A"), { missing: [], unused: [] }, "toString — לא משתנה");
  assert.deepEqual(f("lower=1\nB=2", "process.env.B"), { missing: [], unused: [] }, "רק שמות באותיות גדולות");
});
