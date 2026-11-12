import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";

const ok = async (db, sql, msg) => {
  try {
    await db.query(sql);
  } catch (err) {
    assert.fail(`${msg} — המסד סירב: ${err.message}`);
  }
};

test("P18-E62: חשבון פתוח אחד לכל בעלים", async (t) => {
  const db = await sandbox(t, import.meta.url, "bank.sql");
  await db.runFile("P18-E62.sql");
  const col = await db.rows("SELECT data_type, is_nullable FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'accounts' AND column_name = 'closed_at'");
  assert.deepEqual(col, [{ data_type: "timestamp with time zone", is_nullable: "YES" }], "עמודה closed_at מסוג timestamptz, לא חובה");
  await assert.rejects(db.query("INSERT INTO accounts (owner, balance) VALUES ('dana', 0)"), (e) => e.code === "23505", "dana כש־Dana פתוח — צריך להיחסם");
  await assert.rejects(db.query("INSERT INTO accounts (owner, balance) VALUES ('YOSSI', 0)"), (e) => e.code === "23505", "YOSSI כש־Yossi פתוח");
  await db.query("UPDATE accounts SET closed_at = now() WHERE id = 1");
  await ok(db, "INSERT INTO accounts (owner, balance) VALUES ('dana', 0)", "Dana נסגר — מותר לפתוח חדש");
  await assert.rejects(db.query("INSERT INTO accounts (owner, balance) VALUES ('DANA', 0)"), (e) => e.code === "23505", "עכשיו יש שוב dana פתוח");
  await ok(db, "INSERT INTO accounts (owner, balance, closed_at) VALUES ('Dana', 0, now())", "חשבון סגור נוסף — מותר");
  await ok(db, "INSERT INTO accounts (owner, balance) VALUES ('Dana Levi', 0)", "בעלים אחר");
  await assert.rejects(db.query("UPDATE accounts SET closed_at = NULL WHERE id = 1"), (e) => e.code === "23505", "פתיחה מחדש של החשבון הישן — יהיו שני פתוחים");
});
