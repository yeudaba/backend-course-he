import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { createClassifier } = await load(import.meta.url, "P29-E57.ts");

function setup({ version = "v2", preset = {} } = {}) {
  const db = new Map(Object.entries(preset));
  const calls = [];
  const deps = {
    promptVersion: version,
    async classify(text) { calls.push(text); await new Promise((r) => setTimeout(r, 20)); return { category: text.includes("כסף") ? "refund" : "other", urgency: "normal" }; },
    repo: {
      async get(id) { return db.get(id) ?? null; },
      async save(id, v) { if (db.get(id)?.promptVersion === v.promptVersion) return false; db.set(id, v); return true; },
    },
  };
  return { deps, db, calls };
}

test("שמור ← בלי קריאה; גרסה ישנה ← מסווג", async () => {
  const s = setup({ preset: { t1: { category: "refund", urgency: "high", promptVersion: "v2" }, t2: { category: "other", urgency: "low", promptVersion: "v1" } } });
  const c = createClassifier(s.deps);
  assert.deepEqual(await c("t1", "x"), { category: "refund", urgency: "high", promptVersion: "v2", cached: true });
  assert.equal(s.calls.length, 0);
  const r = await c("t2", "רוצה את הכסף");
  assert.equal(r.cached, false);
  assert.equal(r.category, "refund");
  assert.equal(s.calls.length, 1);
});
test("חדש: מסווג ושומר; במקביל ← קריאה אחת", async () => {
  const s = setup();
  const c = createClassifier(s.deps);
  const [a, b] = await Promise.all([c("t9", "שאלה"), c("t9", "שאלה")]);
  assert.equal(s.calls.length, 1);
  assert.deepEqual(a, { category: "other", urgency: "normal", promptVersion: "v2", cached: false });
  assert.deepEqual(b, a);
  assert.deepEqual(await c("t9", "שאלה"), { category: "other", urgency: "normal", promptVersion: "v2", cached: true });
});
test("מישהו אחר שמר בינתיים ← מחזירים את מה שבמסד", async () => {
  const s = setup();
  const realSave = s.deps.repo.save;
  s.deps.repo.save = async (id, v) => { s.db.set(id, { category: "complaint", urgency: "high", promptVersion: "v2" }); return false; };
  const c = createClassifier(s.deps);
  assert.deepEqual(await c("t5", "x"), { category: "complaint", urgency: "high", promptVersion: "v2", cached: false });
  s.deps.repo.save = realSave;
});
