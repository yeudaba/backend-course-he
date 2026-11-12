import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { exportsOf, typecheck } from "./_ts.mjs";
import { withTimeout } from "./_helpers.mjs";

const FILE = "P18-E41.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["handleTransfer"])).handleTransfer;
const balances = async (db) => (await db.rows("SELECT balance FROM accounts ORDER BY id")).map((r) => r.balance);

test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("201 והעברה במסד", async (t) => {
  const handle = await get();
  const db = await sandbox(t, import.meta.url, "bank.sql");
  const pool = db.pool(3);
  assert.deepEqual(await handle(pool, { fromId: 1, toId: 3, amount: 19.9 }), { status: 201, body: { id: 1 } });
  assert.deepEqual(await handle(pool, { fromId: 4, toId: 2, amount: 5000 }), { status: 201, body: { id: 2 } });
  assert.deepEqual(await balances(db), [980.1, 5250, 19.9, 0]);
});
test("400 — ולידציה, בלי לגעת במסד", async () => {
  const handle = await get();
  const pool = { connect: () => { throw new Error("פנית למסד עם קלט לא תקין"); }, query: () => { throw new Error("פנית למסד"); } };
  for (const body of [null, {}, { fromId: 1, toId: 2 }, { fromId: "1", toId: 2, amount: 5 }, { fromId: 1.5, toId: 2, amount: 5 }, { fromId: 0, toId: 2, amount: 5 }, { fromId: 1, toId: 2, amount: -5 }, { fromId: 1, toId: 2, amount: 0 }, { fromId: 1, toId: 2, amount: 1.005 }]) {
    assert.deepEqual(await handle(pool, body), { status: 400, body: { error: "VALIDATION" } }, JSON.stringify(body));
  }
  assert.deepEqual(await handle(pool, { fromId: 2, toId: 2, amount: 5 }), { status: 400, body: { error: "SAME_ACCOUNT" } });
});
test("404 ו־409 — ROLLBACK, ובלי דליפת חיבורים", async (t) => {
  const handle = await get();
  const db = await sandbox(t, import.meta.url, "bank.sql");
  const pool = db.pool(2);
  assert.deepEqual(await handle(pool, { fromId: 1, toId: 99, amount: 10 }), { status: 404, body: { error: "ACCOUNT_NOT_FOUND" } }, "יעד לא קיים");
  assert.deepEqual(await handle(pool, { fromId: 99, toId: 1, amount: 10 }), { status: 404, body: { error: "ACCOUNT_NOT_FOUND" } }, "מקור לא קיים");
  assert.deepEqual(await handle(pool, { fromId: 2, toId: 1, amount: 250.01 }), { status: 409, body: { error: "INSUFFICIENT_FUNDS" } });
  assert.deepEqual(await balances(db), [1000, 250, 0, 5000], "שום יתרה לא השתנתה");
  assert.equal((await db.rows("SELECT COUNT(*) AS n FROM transfers"))[0].n, 0);
  await withTimeout((async () => {
    for (let i = 0; i < 8; i++) await handle(pool, { fromId: 3, toId: 1, amount: 1 });
    await handle(pool, { fromId: 1, toId: 3, amount: 1 });
  })(), 6000, "נתקע — חיבור לא שוחרר");
  assert.equal(pool.idleCount, pool.totalCount);
});
test("שגיאה אחרת — נזרקת", async (t) => {
  const handle = await get();
  const db = await sandbox(t, import.meta.url, "bank.sql");
  await db.query("DROP TABLE transfers");
  const pool = db.pool(2);
  await assert.rejects(handle(pool, { fromId: 1, toId: 3, amount: 10 }), (e) => e.code === "42P01", "טבלה חסרה (42P01) — לא 404/409, זורקים הלאה");
  assert.deepEqual(await balances(db), [1000, 250, 0, 5000], "ROLLBACK גם כאן");
});
