import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { fromSchema, columns } from "./_cols.mjs";

const REF = `CREATE TABLE members (id serial PRIMARY KEY, full_name text NOT NULL, email text NOT NULL UNIQUE);
CREATE TABLE classes (id serial PRIMARY KEY, title text NOT NULL, starts_at timestamptz(3) NOT NULL, capacity integer NOT NULL DEFAULT 20);
CREATE TABLE bookings (member_id integer NOT NULL REFERENCES members (id) ON DELETE CASCADE, class_id integer NOT NULL REFERENCES classes (id) ON DELETE CASCADE,
  booked_at timestamptz(3) NOT NULL DEFAULT now(), PRIMARY KEY (member_id, class_id));`;

test("P19-E57: אותן טבלאות", async (t) => {
  const db = await fromSchema(t, import.meta.url, "P19-E57.prisma");
  const ref = await sandbox(t, import.meta.url);
  await ref.query(REF);
  for (const table of ["members", "classes", "bookings"]) assert.deepEqual(await columns(db, table), await columns(ref, table), table);
  await db.query("INSERT INTO members (full_name, email) VALUES ('A', 'a@x'), ('B', 'b@x')");
  await db.query("INSERT INTO classes (title, starts_at) VALUES ('Yoga', now()), ('Spin', now())");
  assert.equal((await db.rows("SELECT capacity FROM classes WHERE id = 1"))[0].capacity, 20);
  await assert.rejects(db.query("INSERT INTO members (full_name, email) VALUES ('C', 'a@x')"), undefined, "email ייחודי");
  await db.query("INSERT INTO bookings (member_id, class_id) VALUES (1, 1), (1, 2), (2, 1)");
  await assert.rejects(db.query("INSERT INTO bookings (member_id, class_id) VALUES (1, 1)"), undefined, "המפתח הראשי — הזוג");
  await assert.rejects(db.query("INSERT INTO bookings (member_id, class_id) VALUES (9, 1)"), undefined, "FK ל־members");
  await db.query("DELETE FROM classes WHERE id = 1");
  assert.equal((await db.rows("SELECT COUNT(*) AS n FROM bookings"))[0].n, 1, "מחיקת שיעור ← ההזמנות שלו");
  await db.query("DELETE FROM members WHERE id = 1");
  assert.equal((await db.rows("SELECT COUNT(*) AS n FROM bookings"))[0].n, 0, "מחיקת מנוי ← ההזמנות שלו");
});
