import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P18-E76.ts";
const get = () => exportsOf(import.meta.url, FILE, ["encodeCursor", "decodeCursor", "feed"]);

test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("encodeCursor / decodeCursor", async () => {
  const { encodeCursor, decodeCursor } = await get();
  const d = new Date("2025-06-01T12:00:00.000Z");
  const c = encodeCursor(d, 100000);
  assert.equal(c, Buffer.from("2025-06-01T12:00:00.000Z|100000").toString("base64url"));
  const back = decodeCursor(c);
  assert.equal(back.id, 100000);
  assert.equal(back.createdAt.toISOString(), d.toISOString());
  const b64 = (s) => Buffer.from(s).toString("base64url");
  for (const bad of ["abc", "", b64("nope|5"), b64("2025-06-01T12:00:00.000Z"), b64("2025-06-01T12:00:00.000Z|x"), b64("2025-06-01T12:00:00.000Z|0"), b64("2025-06-01T12:00:00.000Z|1.5"), b64("2025-06-01T12:00:00.000Z|5|7")]) {
    assert.throws(() => decodeCursor(bad), (e) => e.code === "BAD_CURSOR", `צריך BAD_CURSOR: ${JSON.stringify(bad)}`);
  }
});
test("feed — מעבר על כל ההזמנות של לקוח, עמוד אחרי עמוד", async (t) => {
  const { feed } = await get();
  const db = await sandbox(t, import.meta.url, "bank.sql");
  await db.query("UPDATE big_orders SET created_at = '2026-01-01 10:00:00+00' WHERE customer_id = 42 AND id % 3 = 0");
  const pool = db.pool(3);
  const all = await db.rows("SELECT id, total FROM big_orders WHERE customer_id = 42 ORDER BY created_at DESC, id DESC");
  const seen = [];
  let cursor;
  let pages = 0;
  do {
    const page = await feed(pool, { customerId: 42, cursor, limit: 7 });
    seen.push(...page.data);
    cursor = page.nextCursor ?? undefined;
    pages++;
    assert.ok(pages < 30, "יותר מדי עמודים — ה־cursor לא מתקדם");
  } while (cursor);
  assert.deepEqual(seen, all, "כל 100 ההזמנות, בסדר, בלי כפילויות ובלי דילוגים (גם עם הרבה שורות באותו רגע)");
  assert.equal(pages, Math.ceil(all.length / 7));
  const first = await feed(pool, { customerId: 42 });
  assert.equal(first.data.length, 20, "ברירת מחדל 20");
  const exact = await feed(pool, { customerId: 42, limit: 100 });
  assert.equal(exact.data.length, 100);
  assert.equal(exact.nextCursor, null, "בדיוק 100 שורות ו־limit 100 — אין עוד");
  assert.deepEqual(await feed(pool, { customerId: 999999 }), { data: [], nextCursor: null });
  for (const limit of [0, 101, 2.5]) await assert.rejects(feed(pool, { customerId: 42, limit }), (e) => e.code === "BAD_LIMIT");
  await assert.rejects(feed(pool, { customerId: 42, cursor: "garbage" }), (e) => e.code === "BAD_CURSOR");
});
