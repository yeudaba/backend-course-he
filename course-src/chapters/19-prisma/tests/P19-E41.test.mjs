import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { fromSchema, columns } from "./_cols.mjs";

test("P19-E41: בדיוק כמו הטבלה הקיימת", async (t) => {
  const db = await fromSchema(t, import.meta.url, "P19-E41.prisma");
  const ref = await sandbox(t, import.meta.url);
  await ref.query(`CREATE TABLE workshops (id serial PRIMARY KEY, title text NOT NULL, seats integer NOT NULL DEFAULT 12,
    ticket_price numeric(8, 2) NOT NULL, is_online boolean NOT NULL DEFAULT false)`);
  assert.deepEqual(await columns(db, "workshops"), await columns(ref, "workshops"), "העמודות, הטיפוסים, NOT NULL וברירות המחדל");
  const pk = await db.rows("SELECT a.attname FROM pg_index i JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey) WHERE i.indrelid = 'workshops'::regclass AND i.indisprimary");
  assert.deepEqual(pk.map((r) => r.attname), ["id"], "id הוא המפתח הראשי");
});
