import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25-E50.ts", ["pgConnectionOptions"])).pgConnectionOptions;
const NEON = "postgresql://neondb_owner:pw@ep-cool.eu-central-1.aws.neon.tech/neondb";

test("ריק ובלי sslmode", async () => {
  const f = await get();
  assert.deepEqual(f(""), { connectionString: "" });
  assert.deepEqual(f("postgresql://postgres@localhost:5432/dev"), { connectionString: "postgresql://postgres@localhost:5432/dev" });
  assert.deepEqual(f("postgresql://postgres@localhost:5432/dev?sslmode=disable&application_name=api"), { connectionString: "postgresql://postgres@localhost:5432/dev?application_name=api" });
});
test("מצבים עם TLS", async () => {
  const f = await get();
  for (const mode of ["require", "verify-ca", "verify-full"]) {
    assert.deepEqual(f(`${NEON}?sslmode=${mode}&channel_binding=require`), { connectionString: NEON, ssl: { rejectUnauthorized: true } }, mode);
  }
  assert.deepEqual(f(`${NEON}?sslmode=no-verify`), { connectionString: NEON, ssl: { rejectUnauthorized: false } });
  assert.deepEqual(f(`${NEON}?channel_binding=require&connect_timeout=5&sslmode=require`), { connectionString: `${NEON}?connect_timeout=5`, ssl: { rejectUnauthorized: true } });
});
test("ערך לא מוכר", async () => {
  const f = await get();
  assert.throws(() => f(`${NEON}?sslmode=prefer`), { message: "sslmode לא מוכר: prefer" });
  assert.throws(() => f(`${NEON}?sslmode=REQUIRE`), { message: "sslmode לא מוכר: REQUIRE" });
  assert.throws(() => f(`${NEON}?sslmode=toString`), { message: "sslmode לא מוכר: toString" });
});
