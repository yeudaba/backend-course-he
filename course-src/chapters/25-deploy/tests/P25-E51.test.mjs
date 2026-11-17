import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25-E51.ts", ["findSecrets"])).findSecrets;

test("כל הסוגים", async () => {
  const f = await get();
  const text = [
    "const token = 'ghp_" + "a1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6q7R8" + "';",
    "aws_access_key_id = AKIA" + "IOSFODNN7EXAMPLE",
    "-----BEGIN RSA PRIVATE KEY-----",
    "-----BEGIN OPENSSH PRIVATE KEY-----",
    "DATABASE_URL=postgresql://neondb_owner:npg_8f3k@ep-cool.neon.tech/neondb?sslmode=require",
    "url: postgres://app:hunter2@db:5432/app",
    "REDACTED=postgresql://neondb_owner:***@ep-cool.neon.tech/neondb",
    "LOCAL=postgresql://postgres@localhost:5432/dev",
    "JWT_SECRET=k2Jd8sLq0pWz7xYvB4nM",
    'JWT_SECRET: "k2Jd8sLq0pWz7xYvB4nM"',
    "JWT_SECRET=short",
    "JWT_SECRET=dev-only-secret-not-for-production!!   # secret-scan: ignore",
    "nothing here",
    "both: ghp_" + "x".repeat(36) + " and postgres://u:p@h/db",
  ].join("\n");
  assert.deepEqual(f(text), [
    { line: 1, kind: "github-token" },
    { line: 2, kind: "aws-access-key" },
    { line: 3, kind: "private-key" },
    { line: 4, kind: "private-key" },
    { line: 5, kind: "database-url" },
    { line: 6, kind: "database-url" },
    { line: 9, kind: "jwt-secret" },
    { line: 10, kind: "jwt-secret" },
    { line: 14, kind: "github-token" },
    { line: 14, kind: "database-url" },
  ]);
});
test("לא מסמן דברים דומים", async () => {
  const f = await get();
  assert.deepEqual(f("ghp_short\nAKIA123\n-----BEGIN PUBLIC KEY-----\npostgres://localhost/db\nJWT_SECRET=\n"), []);
  assert.deepEqual(f(""), []);
});
