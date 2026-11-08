import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { redactDatabaseUrl, describeDb } = await load(import.meta.url, "P25-E11.ts");
const NEON = "postgresql://app_owner:npg_S3cr3tP4ss@ep-cool-river-a1b2c3.eu-central-1.aws.neon.tech/tasks?sslmode=require&channel_binding=require";

test("redactDatabaseUrl", () => {
  assert.equal(redactDatabaseUrl(NEON), "postgresql://app_owner:***@ep-cool-river-a1b2c3.eu-central-1.aws.neon.tech/tasks?sslmode=require&channel_binding=require");
  assert.equal(redactDatabaseUrl("postgresql://postgres@localhost:5433/dev"), "postgresql://postgres@localhost:5433/dev", "בלי סיסמה — כמו שהוא");
  assert.equal(redactDatabaseUrl("postgres://u:p%40ss@db:5432/x"), "postgres://u:***@db:5432/x", "סיסמה עם תו מקודד");
});
test("describeDb", () => {
  assert.deepEqual(describeDb(NEON), { host: "ep-cool-river-a1b2c3.eu-central-1.aws.neon.tech", port: 5432, database: "tasks", user: "app_owner", ssl: true });
  assert.deepEqual(describeDb("postgresql://postgres@localhost:5433/dev"), { host: "localhost", port: 5433, database: "dev", user: "postgres", ssl: false });
  assert.equal(describeDb("postgresql://u@h/db?sslmode=disable").ssl, false);
});
test("כתובת לא תקינה — שגיאה בלי הסיסמה", () => {
  for (const bad of ["not a url", "mysql://u:S3cr3t@h/db", "postgresql//u:S3cr3t@h/db"]) {
    assert.throws(() => redactDatabaseUrl(bad), (err) => {
      assert.match(err.message, /DATABASE_URL לא תקין/);
      assert.ok(!err.message.includes("S3cr3t"), "הסיסמה לא בהודעה");
      return true;
    });
  }
  assert.throws(() => describeDb("http://x"), /DATABASE_URL/);
});
