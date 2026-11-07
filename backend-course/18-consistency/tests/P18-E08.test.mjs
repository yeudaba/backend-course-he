import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { load } from "../../tools/load.mjs";

const { findByOwner, searchOwners } = await load(import.meta.url, "P18-E08.ts");

test("findByOwner", async (t) => {
  const db = await sandbox(t, import.meta.url, "bank.sql");
  const pool = db.pool(2);
  assert.deepEqual(await findByOwner(pool, "Dana"), [{ id: 1, owner: "Dana", balance: 1000 }]);
  assert.deepEqual(await findByOwner(pool, "dana"), []);
  assert.deepEqual(await findByOwner(pool, "' OR '1'='1"), [], "injection לא מחזירה את כל החשבונות");
  assert.deepEqual(await findByOwner(pool, "Dana'; DROP TABLE accounts; --"), []);
  assert.equal((await db.rows("SELECT COUNT(*) AS n FROM accounts"))[0].n, 4, "הטבלה שרדה");
});
test("searchOwners", async (t) => {
  const db = await sandbox(t, import.meta.url, "bank.sql");
  const pool = db.pool(2);
  await db.query("INSERT INTO accounts (owner, balance) VALUES ('100% Coffee Ltd', 0), ('Mr_X', 0)");
  assert.deepEqual((await searchOwners(pool, "A")).map((r) => r.owner), ["Dana", "Noa", "Avi"]);
  assert.deepEqual((await searchOwners(pool, "%")).map((r) => r.owner), ["100% Coffee Ltd"], "% שהמשתמש הקליד — תו רגיל");
  assert.deepEqual((await searchOwners(pool, "_")).map((r) => r.owner), ["Mr_X"], "_ שהמשתמש הקליד — תו רגיל");
  assert.deepEqual(await searchOwners(pool, "' OR '1'='1"), []);
});
