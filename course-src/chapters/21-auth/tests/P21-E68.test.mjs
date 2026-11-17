import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { exportsOf, code } from "./_ts.mjs";

const FILE = "P21-E68.ts";
const get = () => exportsOf(import.meta.url, FILE, ["insertToken", "findByHash", "revoke", "revokeAllForUser"]);
const TABLE = `CREATE TABLE refresh_tokens (id serial PRIMARY KEY, user_id int NOT NULL, token_hash text NOT NULL UNIQUE, expires_at timestamptz NOT NULL, revoked_at timestamptz)`;
const EXP = new Date("2026-11-12T10:00:00.000Z");
const NOW = new Date("2026-11-05T10:00:00.000Z");

test("insert ו־find", async (t) => {
  const { insertToken, findByHash } = await get();
  const db = await sandbox(t, import.meta.url);
  await db.query(TABLE);
  const id1 = await insertToken(db.client, 1, "h1", EXP);
  const id2 = await insertToken(db.client, 2, "h2", EXP);
  assert.equal(typeof id1, "number");
  assert.notEqual(id1, id2);
  const r = await findByHash(db.client, "h1");
  assert.deepEqual(r, { id: id1, userId: 1, expiresAt: EXP, revokedAt: null });
  assert.equal(await findByHash(db.client, "nope"), undefined);
  assert.equal(await findByHash(db.client, "' OR '1'='1"), undefined, "פרמטרים, לא הדבקת מחרוזות");
  await assert.rejects(insertToken(db.client, 3, "h1", EXP), (e) => e.code === "23505", "token_hash ייחודי");
});
test("revoke — פעם אחת בלבד", async (t) => {
  const { insertToken, findByHash, revoke } = await get();
  const db = await sandbox(t, import.meta.url);
  await db.query(TABLE);
  const id = await insertToken(db.client, 1, "h1", EXP);
  assert.equal(await revoke(db.client, id, NOW), true);
  assert.equal(await revoke(db.client, id, new Date("2026-11-06T00:00:00Z")), false, "כבר בוטל");
  assert.deepEqual((await findByHash(db.client, "h1")).revokedAt, NOW, "revoked_at לא נדרס בקריאה השנייה");
  assert.equal(await revoke(db.client, 9999, NOW), false);
});
test("revoke — 10 קריאות במקביל, בדיוק אחת מצליחה", async (t) => {
  const { insertToken, revoke } = await get();
  const db = await sandbox(t, import.meta.url);
  await db.query(TABLE);
  const pool = db.pool(10);
  for (let round = 0; round < 3; round++) {
    const id = await insertToken(db.client, 1, `race-${round}`, EXP);
    const results = await Promise.all(Array.from({ length: 10 }, () => revoke(pool, id, NOW)));
    assert.equal(results.filter(Boolean).length, 1, `סבב ${round + 1}: ${results.filter(Boolean).length} קריאות קיבלו true`);
  }
});
test("revokeAllForUser", async (t) => {
  const { insertToken, revoke, revokeAllForUser, findByHash } = await get();
  const db = await sandbox(t, import.meta.url);
  await db.query(TABLE);
  const a = await insertToken(db.client, 1, "a", EXP);
  await insertToken(db.client, 1, "b", EXP);
  await insertToken(db.client, 1, "c", EXP);
  await insertToken(db.client, 2, "d", EXP);
  await revoke(db.client, a, new Date("2026-11-01T00:00:00Z"));
  assert.equal(await revokeAllForUser(db.client, 1, NOW), 2, "רק מה שעוד לא בוטל");
  assert.deepEqual((await findByHash(db.client, "a")).revokedAt, new Date("2026-11-01T00:00:00Z"), "הישן לא נדרס");
  assert.deepEqual((await findByHash(db.client, "b")).revokedAt, NOW);
  assert.equal((await findByHash(db.client, "d")).revokedAt, null, "של משתמש אחר — לא נגעו");
  assert.equal(await revokeAllForUser(db.client, 1, NOW), 0);
});
test("פרמטרים", () => {
  const src = code(import.meta.url, FILE);
  assert.match(src, /\$1/, "שאילתות עם $1, $2...");
  assert.doesNotMatch(src, /\$\{\s*(tokenHash|userId|id)\s*\}/, "בלי הדבקת ערכים לתוך ה־SQL");
});
