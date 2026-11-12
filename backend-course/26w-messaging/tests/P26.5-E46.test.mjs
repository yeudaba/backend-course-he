import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";

test("next_id ו־lag לכל group", async (t) => {
  const db = await sandbox(t, import.meta.url);
  await db.query(`CREATE TABLE events (id bigserial PRIMARY KEY, type text NOT NULL, payload jsonb NOT NULL DEFAULT '{}');
    CREATE TABLE group_offsets (group_name text PRIMARY KEY, last_id bigint NOT NULL);
    INSERT INTO events (type) SELECT 'order.placed' FROM generate_series(1, 6);
    INSERT INTO group_offsets VALUES ('emails', 4), ('analytics', 1), ('stock', 6), ('audit', 4)`);
  assert.deepEqual(await db.fileRows("P26.5-E46.sql"), [
    { group_name: "analytics", next_id: 2, lag: 5 },
    { group_name: "audit", next_id: 5, lag: 2 },
    { group_name: "emails", next_id: 5, lag: 2 },
    { group_name: "stock", next_id: null, lag: 0 },
  ]);
});
