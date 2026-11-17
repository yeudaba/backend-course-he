import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P19-E46.ts";
test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("פירוק כתובות", async () => {
  const { describeDbUrl } = await exportsOf(import.meta.url, FILE, ["describeDbUrl"]);
  assert.deepEqual(describeDbUrl("postgresql://postgres:s3cret@localhost:5433/shop?schema=public"), { host: "localhost", port: 5433, database: "shop", user: "postgres", password: "***" });
  assert.deepEqual(describeDbUrl("postgres://localhost/course"), { host: "localhost", port: 5432, database: "course", user: "", password: null });
  assert.deepEqual(describeDbUrl("postgresql://dana%40work:p%3Aa%40ss@db.internal:6000/tasks_dev"), { host: "db.internal", port: 6000, database: "tasks_dev", user: "dana@work", password: "***" });
  assert.deepEqual(describeDbUrl("postgresql://app@db.example/app"), { host: "db.example", port: 5432, database: "app", user: "app", password: null });
  const out = JSON.stringify(describeDbUrl("postgresql://u:TopSecret@h/db"));
  assert.ok(!out.includes("TopSecret"), "הסיסמה לא מופיעה בתוצאה");
});
test("כתובות לא תקינות", async () => {
  const { describeDbUrl } = await exportsOf(import.meta.url, FILE, ["describeDbUrl"]);
  for (const bad of ["not a url", "", "mysql://root@localhost:3306/shop", "postgresql://localhost:5432", "postgresql://localhost:5432/", "https://example.com/db"]) {
    assert.throws(() => describeDbUrl(bad), { message: "כתובת מסד לא תקינה" }, JSON.stringify(bad));
  }
});
