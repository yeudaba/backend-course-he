import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { sandbox } from "../../tools/sql.mjs";

const { appendMessages, loadMessages } = await load(import.meta.url, "P29.5-E40.ts");
const TABLE = `CREATE TABLE agent_messages (conversation_id text NOT NULL, seq int NOT NULL, role text NOT NULL, content jsonb NOT NULL, PRIMARY KEY (conversation_id, seq))`;

test("להוסיף ולטעון, לפי seq", async (t) => {
  const db = await sandbox(t, import.meta.url);
  await db.query(TABLE);
  assert.equal(await appendMessages(db.client, "c1", 0, [{ role: "user", content: "מה עם הזמנה 3?" }]), 1);
  const asst = { role: "assistant", content: [{ type: "tool_use", id: "t1", name: "get_order", input: { orderId: 3 } }] };
  const res = { role: "user", content: [{ type: "tool_result", tool_use_id: "t1", content: "it's \"shipped\"" }] };
  assert.equal(await appendMessages(db.client, "c1", 1, [asst, res]), 3);
  assert.equal(await appendMessages(db.client, "c2", 0, [{ role: "user", content: "אחר" }]), 1);
  assert.deepEqual(await loadMessages(db.client, "c1"), [{ role: "user", content: "מה עם הזמנה 3?" }, asst, res]);
  assert.deepEqual(await loadMessages(db.client, "nope"), []);
  assert.deepEqual((await db.rows("SELECT seq FROM agent_messages WHERE conversation_id = 'c1' ORDER BY seq")).map((r) => r.seq), [0, 1, 2]);
});
test("expectedCount לא נכון ← conflict, ושום הודעה לא נכנסת", async (t) => {
  const db = await sandbox(t, import.meta.url);
  await db.query(TABLE);
  await appendMessages(db.client, "c", 0, [{ role: "user", content: "a" }, { role: "assistant", content: "b" }]);
  await assert.rejects(appendMessages(db.client, "c", 1, [{ role: "user", content: "x" }]), /conflict/);
  await assert.rejects(appendMessages(db.client, "c", 5, [{ role: "user", content: "x" }]), /conflict/);
  assert.equal((await loadMessages(db.client, "c")).length, 2);
  assert.equal(await appendMessages(db.client, "c", 2, [{ role: "user", content: "c" }]), 3, "החיבור עדיין תקין אחרי ROLLBACK");
});
test("שני תהליכים במקביל — אחד מצליח, השני conflict", async (t) => {
  const db = await sandbox(t, import.meta.url);
  await db.query(TABLE);
  await appendMessages(db.client, "c", 0, [{ role: "user", content: "q" }]);
  const pool = db.pool(2);
  const [a, b] = [await pool.connect(), await pool.connect()];
  const r = await Promise.allSettled([
    appendMessages(a, "c", 1, [{ role: "assistant", content: "from A" }, { role: "user", content: "A2" }]),
    appendMessages(b, "c", 1, [{ role: "assistant", content: "from B" }]),
  ]);
  a.release();
  b.release();
  assert.deepEqual(r.map((x) => x.status).sort(), ["fulfilled", "rejected"]);
  assert.match(r.find((x) => x.status === "rejected").reason.message, /conflict/);
  const all = await loadMessages(db.client, "c");
  assert.ok(all.length === 2 || all.length === 3);
  assert.ok(!(all.some((m) => m.content === "from A") && all.some((m) => m.content === "from B")), "ההיסטוריה לא מתפצלת");
});
