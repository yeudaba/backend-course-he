import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P23-E89.ts", ["startupWaves"])).startupWaves;

test("הפרויקט", async () => {
  const waves = await get();
  const doc = { services: { db: {}, migrate: { depends_on: { db: { condition: "service_healthy" } } }, api: { depends_on: { migrate: { condition: "service_completed_successfully" } } }, web: { depends_on: ["api"] } } };
  assert.deepEqual(waves(doc), [["db"], ["migrate"], ["api"], ["web"]]);
});
test("כמה בגל, סדר הקובץ", async () => {
  const waves = await get();
  const doc = { services: { app: { depends_on: ["db", "cache"] }, worker: { depends_on: { cache: {} } }, cache: {}, db: {}, web: { depends_on: ["app"] }, docs: {} } };
  assert.deepEqual(waves(doc), [["cache", "db", "docs"], ["app", "worker"], ["web"]]);
  assert.deepEqual(waves({ services: {} }), []);
});
test("שגיאות", async () => {
  const waves = await get();
  assert.throws(() => waves({ services: { app: { depends_on: ["db"] } } }), { message: "app תלוי ב־db שלא קיים" });
  assert.throws(() => waves({ services: { db: {}, a: { depends_on: ["b"] }, b: { depends_on: { a: {} } }, c: { depends_on: ["a"] } } }), { message: "מעגל תלויות: a, b, c" });
});
