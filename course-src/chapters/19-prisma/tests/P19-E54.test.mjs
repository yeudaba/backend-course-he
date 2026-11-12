import { test } from "node:test";
import assert from "node:assert/strict";
import { fromSchema, columns } from "./_cols.mjs";

test("P19-E54: users, teams, memberships", async (t) => {
  const db = await fromSchema(t, import.meta.url, "P19-E54.prisma");
  assert.deepEqual(await columns(db, "users"), { email: "text NOT NULL", id: "integer NOT NULL DEFAULT autoincrement" });
  assert.deepEqual(await columns(db, "teams"), { id: "integer NOT NULL DEFAULT autoincrement", name: "text NOT NULL" });
  assert.deepEqual(await columns(db, "memberships"), {
    joined_at: "timestamp with time zone NOT NULL DEFAULT now", role: "USER-DEFINED NOT NULL DEFAULT member", team_id: "integer NOT NULL", user_id: "integer NOT NULL",
  });
  const labels = await db.rows("SELECT e.enumlabel FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid JOIN pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = current_schema() AND t.typname = 'Role' ORDER BY e.enumsortorder");
  assert.deepEqual(labels.map((r) => r.enumlabel), ["member", "admin", "owner"], "enum Role, בסדר הזה");
  await db.query("INSERT INTO users (email) VALUES ('a@x'), ('b@x'), ('c@x'); INSERT INTO teams (name) VALUES ('core'), ('web')");
  await assert.rejects(db.query("INSERT INTO users (email) VALUES ('a@x')"), undefined, "email ייחודי");
  await assert.rejects(db.query("INSERT INTO teams (name) VALUES ('core')"), undefined, "name ייחודי");
  await db.query("INSERT INTO memberships (user_id, team_id) VALUES (1, 1), (1, 2), (2, 1)");
  await db.query("INSERT INTO memberships (user_id, team_id, role) VALUES (3, 2, 'owner')");
  await assert.rejects(db.query("INSERT INTO memberships (user_id, team_id) VALUES (1, 1)"), undefined, "אותו זוג פעמיים");
  await assert.rejects(db.query("INSERT INTO memberships (user_id, team_id, role) VALUES (2, 2, 'boss')"), undefined, "role לא ב־enum");
  assert.equal((await db.rows("SELECT role::text AS r FROM memberships WHERE user_id = 2"))[0].r, "member");
  await db.query("DELETE FROM users WHERE id = 1");
  assert.equal((await db.rows("SELECT COUNT(*) AS n FROM memberships"))[0].n, 2, "מחיקת משתמש ← החברויות שלו");
  await db.query("DELETE FROM teams WHERE id = 2");
  assert.equal((await db.rows("SELECT COUNT(*) AS n FROM memberships"))[0].n, 1, "מחיקת צוות ← החברויות שלו");
});
