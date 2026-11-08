import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { checkMigration } = await load(import.meta.url, "P25-E16.ts");
const rules = (sql) => checkMigration(sql).map((f) => `${f.line}:${f.rule}`);

test("migration בטוח — בלי ממצאים", () => {
  assert.deepEqual(rules(`-- AlterTable
ALTER TABLE "users" ADD COLUMN "time_zone" TEXT NOT NULL DEFAULT 'UTC';
ALTER TABLE "tasks" ADD COLUMN "archived_at" TIMESTAMPTZ(3);
CREATE INDEX CONCURRENTLY "tasks_owner_idx" ON "tasks"("owner_id");
CREATE TABLE "idempotency_keys" ("id" SERIAL NOT NULL);`), []);
});
test("כל הכללים, עם מספרי שורות", () => {
  assert.deepEqual(rules(`ALTER TABLE "tasks" DROP COLUMN "priority";
DROP TABLE "legacy_tasks";
ALTER TABLE "tasks" RENAME COLUMN "title" TO "name";
ALTER TABLE "users" ADD COLUMN "phone" TEXT NOT NULL;
ALTER TABLE "tasks" ALTER COLUMN "status" SET DATA TYPE TEXT;
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");`), ["1:drop-column", "2:drop-table", "3:rename", "4:not-null-without-default", "5:alter-type", "6:index-without-concurrently"]);
});
test("הערות לא נחשבות, ואותיות קטנות כן", () => {
  assert.deepEqual(rules(`-- DROP COLUMN "old" (אחרי ה־deploy הבא)
alter table tasks drop column notes;
ALTER TABLE t RENAME TO t2;`), ["2:drop-column", "3:rename"]);
});
test("לכל ממצא — הסבר", () => {
  const [f] = checkMigration('ALTER TABLE "tasks" DROP COLUMN "priority";');
  assert.equal(typeof f.message, "string");
  assert.ok(f.message.length > 10);
});
