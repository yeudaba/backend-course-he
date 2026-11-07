import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { IdempotencyStore } = await load(import.meta.url, "P24-E14.ts");
const setup = (ttlMs = 1000) => {
  const clock = { t: 0 };
  return { clock, store: new IdempotencyStore({ ttlMs, now: () => clock.t }) };
};

test("new ← in_progress ← replay", () => {
  const { store } = setup();
  assert.deepEqual(store.begin("u1", "k1", "fp"), { kind: "new" });
  assert.deepEqual(store.begin("u1", "k1", "fp"), { kind: "in_progress" });
  store.complete("u1", "k1", { status: 201, body: { id: 7 } });
  assert.deepEqual(store.begin("u1", "k1", "fp"), { kind: "replay", response: { status: 201, body: { id: 7 } } });
  assert.deepEqual(store.begin("u1", "k1", "fp"), { kind: "replay", response: { status: 201, body: { id: 7 } } }, "וגם בפעם השלישית");
});
test("mismatch", () => {
  const { store } = setup();
  store.begin("u1", "k1", "fp-a");
  assert.deepEqual(store.begin("u1", "k1", "fp-b"), { kind: "mismatch" }, "גם כשעדיין בטיפול");
  store.complete("u1", "k1", { status: 201, body: {} });
  assert.deepEqual(store.begin("u1", "k1", "fp-b"), { kind: "mismatch" });
});
test("scope: לכל משתמש בנפרד", () => {
  const { store } = setup();
  store.begin("u1", "k1", "fp");
  assert.deepEqual(store.begin("u2", "k1", "fp"), { kind: "new" });
  assert.deepEqual(store.begin("a:b", "c", "fp"), { kind: "new" });
  assert.deepEqual(store.begin("a", "b:c", "fp"), { kind: "new" }, "('a:b','c') ו־('a','b:c') — לא אותו דבר");
});
test("release — רק בטיפול", () => {
  const { store } = setup();
  store.begin("u1", "k1", "fp");
  store.release("u1", "k1");
  assert.deepEqual(store.begin("u1", "k1", "other"), { kind: "new" }, "אחרי release — מפתח פנוי");
  store.complete("u1", "k1", { status: 201, body: 1 });
  store.release("u1", "k1");
  assert.equal(store.begin("u1", "k1", "other").kind, "replay", "release לא מוחק תשובה שנשמרה");
});
test("complete בלי begin", () => {
  const { store } = setup();
  assert.throws(() => store.complete("u1", "nope", { status: 200, body: null }), { message: "אין בקשה כזו בטיפול" });
});
test("תוקף", () => {
  const { store, clock } = setup(1000);
  store.begin("u1", "k1", "fp");
  store.complete("u1", "k1", { status: 201, body: 1 });
  clock.t = 999;
  assert.equal(store.begin("u1", "k1", "fp").kind, "replay");
  clock.t = 1000;
  assert.deepEqual(store.begin("u1", "k1", "other"), { kind: "new" }, "בדיוק ttlMs — פג");
});
test("sweep ו־size", () => {
  const { store, clock } = setup(1000);
  store.begin("u1", "a", "fp");
  clock.t = 500;
  store.begin("u1", "b", "fp");
  assert.equal(store.size, 2);
  clock.t = 1200;
  assert.equal(store.sweep(), 1);
  assert.equal(store.size, 1);
  clock.t = 1500;
  assert.equal(store.sweep(), 1);
  assert.equal(store.size, 0);
});
test("ברירת מחדל: 24 שעות ו־Date.now", () => {
  const store = new IdempotencyStore();
  store.begin("u", "k", "fp");
  assert.equal(store.begin("u", "k", "fp").kind, "in_progress");
});
