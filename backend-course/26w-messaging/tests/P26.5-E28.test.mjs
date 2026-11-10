import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";

const FILE = "P26.5-E28.sql";

test("P26.5-E28: האירוע הבא לכל מפתח (עמודות, שורות וסדר)", async (t) => {
  const db = await sandbox(t, import.meta.url, "outbox-next.sql");
  const got = await db.fileRows(FILE);
  assert.deepEqual(Object.keys(got?.[0] ?? {}), ["topic", "key", "next_id", "event_type", "pending"], "שמות העמודות והסדר שלהן");
  const rows = got.map((r) => [r.topic, r.key, Number(r.next_id), r.event_type, Number(r.pending)]);
  assert.ok(!rows.some((r) => r[1] === "order-4"), "order-4 כבר פורסם — אין לו אירוע הבא");
  assert.deepEqual(rows.find((r) => r[1] === "order-1" && r[0] === "orders"), ["orders", "order-1", 6, "OrderShipped", 2], "order-1: אירועים 1 ו־3 כבר פורסמו, ממתינים 6 ו־10. סנן published_at IS NULL לפני החלון");
  assert.ok(rows.some((r) => r[0] === "audit" && r[1] === "order-1"), "אותו key ב־topic אחר הוא רצף נפרד — PARTITION BY topic, key");
  assert.deepEqual(rows, [
    ["orders", "order-2", 4, "OrderPaid", 2],
    ["payments", "pay-9", 5, "PaymentCaptured", 2],
    ["orders", "order-1", 6, "OrderShipped", 2],
    ["orders", "order-3", 8, "OrderPlaced", 1],
    ["audit", "order-1", 11, "OrderViewed", 1],
  ], "מיון לפי next_id");
});
test("P26.5-E28: אחרי פרסום, הבא בתור מתקדם", async (t) => {
  const db = await sandbox(t, import.meta.url, "outbox-next.sql");
  await db.query("UPDATE outbox SET published_at = now() WHERE id IN (4, 8)");
  const rows = (await db.fileRows(FILE)).map((r) => [r.key, Number(r.next_id), Number(r.pending)]);
  assert.deepEqual(rows.find((r) => r[0] === "order-2"), ["order-2", 7, 1]);
  assert.ok(!rows.some((r) => r[0] === "order-3"), "order-3 פורסם כולו");
});
