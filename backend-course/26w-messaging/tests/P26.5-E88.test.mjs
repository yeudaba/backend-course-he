import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";

test("lag לכל group/topic/partition, כולל בלי commit", async (t) => {
  const db = await sandbox(t, import.meta.url);
  await db.query(`CREATE TABLE end_offsets (topic text, partition int, end_offset bigint, PRIMARY KEY (topic, partition));
    CREATE TABLE committed_offsets (group_name text, topic text, partition int, committed bigint, PRIMARY KEY (group_name, topic, partition));
    INSERT INTO end_offsets VALUES ('orders', 0, 10400), ('orders', 1, 10210), ('orders', 2, 58000), ('payments', 0, 50);
    INSERT INTO committed_offsets VALUES ('emails', 'orders', 0, 10395), ('emails', 'orders', 1, 10205), ('emails', 'orders', 2, 12000),
      ('analytics', 'orders', 0, 10400), ('billing', 'payments', 0, 50)`);
  assert.deepEqual(await db.fileRows("P26.5-E88.sql"), [
    { group_name: "analytics", topic: "orders", partition: 2, lag: 58000 },
    { group_name: "emails", topic: "orders", partition: 2, lag: 46000 },
    { group_name: "analytics", topic: "orders", partition: 1, lag: 10210 },
    { group_name: "emails", topic: "orders", partition: 0, lag: 5 },
    { group_name: "emails", topic: "orders", partition: 1, lag: 5 },
    { group_name: "analytics", topic: "orders", partition: 0, lag: 0 },
    { group_name: "billing", topic: "payments", partition: 0, lag: 0 },
  ]);
});
