import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox, sameAsSolution } from "../../tools/sql.mjs";

const accepts = async (db, sql, msg) => {
  try {
    await db.query(sql);
  } catch (err) {
    assert.fail(`${msg} — המסד דחה: ${err.message}`);
  }
};
const rejects = async (db, sql, msg) => assert.rejects(db.query(sql), undefined, `${msg} — המסד היה צריך לדחות את השורה`);

test("P16-E26: התוצאה של השאילתה (עמודות, שורות וסדר)", async (t) => {
  // אחרי הקובץ שלך הבודק מוסיף עוד אימונים ומריץ שוב את השאילתה האחרונה — כדי שתוצאה מועתקת לא תעבור
  await sameAsSolution(t, import.meta.url, "P16-E26.sql", {
    after: "INSERT INTO workouts (kind, minutes, distance_km, done_on) VALUES ('bike', 60, 24, '2026-10-30'), ('swim', 20, NULL, '2026-11-04'), ('run', 50, 8, '2026-11-04')",
  });
});
test("P16-E26: ארבעת האימונים נשמרו", async (t) => {
  const db = await sandbox(t, import.meta.url);
  await db.runFile("P16-E26.sql");
  const rows = await db.rows("SELECT id, kind, minutes, distance_km, done_on::text AS done_on, note FROM workouts ORDER BY id");
  assert.deepEqual(rows, [
    { id: 1, kind: "run", minutes: 30, distance_km: 5.2, done_on: "2026-11-01", note: null },
    { id: 2, kind: "swim", minutes: 45, distance_km: null, done_on: "2026-11-02", note: "pool" },
    { id: 3, kind: "bike", minutes: 90, distance_km: 32.5, done_on: "2026-11-03", note: null },
    { id: 4, kind: "run", minutes: 25, distance_km: 4.1, done_on: "2026-11-05", note: "hills" },
  ]);
});
test("P16-E26: אילוצים וברירות מחדל", async (t) => {
  const db = await sandbox(t, import.meta.url);
  await db.runFile("P16-E26.sql");
  await accepts(db, "INSERT INTO workouts (kind, minutes) VALUES ('swim', 600)", "שחייה של 600 דקות, בלי מרחק, תאריך והערה");
  const [r] = await db.rows("SELECT done_on = CURRENT_DATE AS today FROM workouts WHERE minutes = 600");
  assert.equal(r.today, true, "done_on — ברירת מחדל: היום (DEFAULT CURRENT_DATE)");
  await rejects(db, "INSERT INTO workouts (kind, minutes) VALUES ('walk', 30)", "kind = 'walk'");
  await rejects(db, "INSERT INTO workouts (kind, minutes) VALUES ('RUN', 30)", "kind = 'RUN' (אותיות גדולות)");
  await rejects(db, "INSERT INTO workouts (minutes) VALUES (30)", "kind חובה");
  await rejects(db, "INSERT INTO workouts (kind) VALUES ('run')", "minutes חובה");
  await rejects(db, "INSERT INTO workouts (kind, minutes) VALUES ('run', 0)", "minutes = 0");
  await rejects(db, "INSERT INTO workouts (kind, minutes) VALUES ('run', 601)", "minutes = 601");
  await rejects(db, "INSERT INTO workouts (kind, minutes, distance_km) VALUES ('run', 30, 0)", "distance_km = 0");
  await rejects(db, "INSERT INTO workouts (kind, minutes, distance_km) VALUES ('run', 30, -2)", "distance_km שלילי");
  await rejects(db, "INSERT INTO workouts (kind, minutes, done_on) VALUES ('run', 30, NULL)", "done_on חובה (NOT NULL)");
  await rejects(db, "INSERT INTO workouts (id, kind, minutes) VALUES (99, 'run', 30)", "id — רק המסד ממספר (GENERATED ALWAYS)");
});
