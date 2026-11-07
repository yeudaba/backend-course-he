import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { load } from "../../tools/load.mjs";

const { withSerializableRetry } = await load(import.meta.url, "P18-E19.ts");

test("15 העלאות מונה במקביל", async (t) => {
  const db = await sandbox(t, import.meta.url);
  await db.query("CREATE TABLE counter (id integer PRIMARY KEY, n integer NOT NULL); INSERT INTO counter VALUES (1, 0)");
  const pool = db.pool(15);
  const increment = async (client) => {
    const { rows } = await client.query("SELECT n FROM counter WHERE id = 1");
    await new Promise((r) => setTimeout(r, 5));
    await client.query("UPDATE counter SET n = $1 WHERE id = 1", [rows[0].n + 1]);
    return rows[0].n + 1;
  };
  const results = await Promise.allSettled(Array.from({ length: 15 }, () => withSerializableRetry(pool, increment, { retries: 100 })));
  const failed = results.filter((r) => r.status === "rejected");
  assert.equal(failed.length, 0, `נכשלו: ${failed.map((r) => r.reason.code ?? r.reason.message).join(", ")}`);
  assert.equal((await db.rows("SELECT n FROM counter"))[0].n, 15);
  assert.deepEqual(results.map((r) => r.value).sort((a, b) => a - b), Array.from({ length: 15 }, (_, i) => i + 1), "מחזירה את מה ש־work החזיר");
  assert.equal(pool.idleCount, pool.totalCount);
});
test("שגיאה אחרת — מיד, בלי ניסיון חוזר", async (t) => {
  const db = await sandbox(t, import.meta.url);
  const pool = db.pool(2);
  let calls = 0;
  await assert.rejects(withSerializableRetry(pool, async () => { calls++; throw new Error("boom"); }), { message: "boom" });
  assert.equal(calls, 1);
});
test("נגמרו הניסיונות", async (t) => {
  const db = await sandbox(t, import.meta.url);
  const pool = db.pool(2);
  let calls = 0;
  const conflict = async () => { calls++; throw Object.assign(new Error("could not serialize"), { code: "40001" }); };
  await assert.rejects(withSerializableRetry(pool, conflict, { retries: 2 }), (e) => e.code === "40001");
  assert.equal(calls, 3, "ניסיון ראשון + 2 חוזרים");
  assert.equal(pool.idleCount, pool.totalCount);
});
