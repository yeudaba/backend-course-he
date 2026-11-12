import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

test("P19-E35: ההגדרות", async () => {
  process.env.APP_DATABASE_URL = "postgresql://app@db.example:5432/app";
  const mod = await load(import.meta.url, "P19-E35.config.ts");
  const cfg = mod.default;
  assert.ok(cfg && typeof cfg === "object", "צריך export default defineConfig({ ... })");
  assert.equal(cfg.schema, "db/schema.prisma");
  assert.equal(cfg.migrations?.path, "db/migrations");
  assert.equal(cfg.migrations?.seed, "node db/seed.ts");
  assert.equal(cfg.datasource?.url, "postgresql://app@db.example:5432/app", "הכתובת מ־process.env.APP_DATABASE_URL");
});
