import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P24-E99.ts", ["reserve"])).reserve;
const NOW = new Date("2026-11-07T12:00:00Z");
const hoursAgo = (h) => new Date(NOW.getTime() - h * 3_600_000);

// "מסד" בזיכרון עם UNIQUE (userId, key). hooks — כדי לדמות מישהו אחר שפועל באמצע
function fakeDb({ afterFind } = {}) {
  const rows = new Map();
  let nextId = 1;
  const calls = [];
  const db = {
    rows,
    calls,
    async create(data) {
      calls.push("create");
      const k = `${data.userId}:${data.key}`;
      if (rows.has(k)) throw Object.assign(new Error("Unique constraint failed"), { code: "P2002" });
      rows.set(k, { id: nextId++, fingerprint: data.fingerprint, status: null, body: null, createdAt: data.createdAt });
    },
    async findUnique(userId, key) {
      calls.push("find");
      const row = rows.get(`${userId}:${key}`) ?? null;
      afterFind?.(rows, userId, key);
      return row && { ...row };
    },
    async deleteById(id) {
      calls.push("delete");
      for (const [k, r] of rows) if (r.id === id) rows.delete(k);
    },
  };
  return db;
}

test("new, ואז in_progress / mismatch / replay", async () => {
  const reserve = await get();
  const db = fakeDb();
  assert.deepEqual(await reserve(db, 1, "k1", "fp", NOW, 24), { kind: "new" });
  assert.deepEqual(await reserve(db, 1, "k1", "fp", NOW, 24), { kind: "in_progress" });
  assert.deepEqual(await reserve(db, 1, "k1", "other", NOW, 24), { kind: "mismatch" });
  db.rows.get("1:k1").status = 201;
  db.rows.get("1:k1").body = { id: 9 };
  assert.deepEqual(await reserve(db, 1, "k1", "fp", NOW, 24), { kind: "replay", status: 201, body: { id: 9 } });
  assert.deepEqual(await reserve(db, 2, "k1", "fp", NOW, 24), { kind: "new" }, "משתמש אחר");
});
test("פג תוקף ← נמחק ומתחילים מחדש", async () => {
  const reserve = await get();
  const db = fakeDb();
  await db.create({ userId: 1, key: "k", fingerprint: "old", createdAt: hoursAgo(24) });
  db.rows.get("1:k").status = 201;
  db.calls.length = 0;
  assert.deepEqual(await reserve(db, 1, "k", "new-fp", NOW, 24), { kind: "new" }, "בדיוק 24 שעות ← פג");
  assert.deepEqual(db.calls, ["create", "find", "delete", "create"]);
  assert.equal(db.rows.get("1:k").fingerprint, "new-fp");
  await db.create({ userId: 1, key: "fresh", fingerprint: "a", createdAt: hoursAgo(23.9) });
  assert.deepEqual(await reserve(db, 1, "fresh", "b", NOW, 24), { kind: "mismatch" }, "עוד בתוקף");
});
test("נמחק בין create ל־find ← סיבוב נוסף", async () => {
  const reserve = await get();
  let once = true;
  const db = fakeDb();
  await db.create({ userId: 1, key: "k", fingerprint: "fp", createdAt: NOW });
  const origFind = db.findUnique;
  db.findUnique = async (u, k) => {
    if (once) { once = false; db.rows.delete(`${u}:${k}`); }
    return origFind(u, k);
  };
  assert.deepEqual(await reserve(db, 1, "k", "fp", NOW, 24), { kind: "new" });
});
test("לכל היותר 2 סיבובים", async () => {
  const reserve = await get();
  const db = fakeDb();
  db.create = async () => { db.calls.push("create"); throw Object.assign(new Error("dup"), { code: "P2002" }); };
  db.findUnique = async () => { db.calls.push("find"); return null; };
  assert.deepEqual(await reserve(db, 1, "k", "fp", NOW, 24), { kind: "in_progress" });
  assert.deepEqual(db.calls, ["create", "find", "create", "find"]);
});
test("שגיאה אחרת — עוברת הלאה", async () => {
  const reserve = await get();
  const db = fakeDb();
  db.create = async () => { throw Object.assign(new Error("Can't reach database server"), { code: "P1001" }); };
  await assert.rejects(reserve(db, 1, "k", "fp", NOW, 24), { message: "Can't reach database server" });
  db.create = async () => { throw new Error("boom"); };
  await assert.rejects(reserve(db, 1, "k", "fp", NOW, 24), { message: "boom" });
});
