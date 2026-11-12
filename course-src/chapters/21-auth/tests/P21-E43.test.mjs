import { test } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { createHash } from "node:crypto";
import { exportsOf, code } from "./_ts.mjs";

const FILE = "P21-E43.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["verifyAndUpgrade"])).verifyAndUpgrade;
const sha = (s) => createHash("sha256").update(s).digest("hex");
const saver = () => {
  const saved = [];
  return { saved, save: async (id, h) => void saved.push([id, h]) };
};

test("hash ישן ונכון ← true, ונשמר bcrypt", async () => {
  const verify = await get();
  const { saved, save } = saver();
  assert.equal(await verify({ id: 7, passwordHash: sha("שלום-עולם-1") }, "שלום-עולם-1", save, 4), true);
  assert.equal(saved.length, 1);
  assert.equal(saved[0][0], 7);
  assert.equal(bcrypt.getRounds(saved[0][1]), 4, "hash חדש של bcrypt עם rounds");
  assert.ok(await bcrypt.compare("שלום-עולם-1", saved[0][1]));
});
test("hash ישן ושגוי ← false, בלי לשמור", async () => {
  const verify = await get();
  const { saved, save } = saver();
  assert.equal(await verify({ id: 7, passwordHash: sha("right") }, "wrong", save, 4), false);
  assert.equal(await verify({ id: 7, passwordHash: sha("right").toUpperCase() }, "right", save, 4), false, "רק hex באותיות קטנות נחשב hash ישן");
  assert.deepEqual(saved, []);
});
test("bcrypt ← compare, בלי לשמור", async () => {
  const verify = await get();
  const { saved, save } = saver();
  const h = await bcrypt.hash("pass-word", 4);
  assert.equal(await verify({ id: 1, passwordHash: h }, "pass-word", save, 4), true);
  assert.equal(await verify({ id: 1, passwordHash: h }, "pass-wordd", save, 4), false);
  assert.deepEqual(saved, []);
});
test("צורות אחרות ← false, בלי חריגה", async () => {
  const verify = await get();
  const { saved, save } = saver();
  for (const passwordHash of ["", "plain-password", sha("x").slice(1), sha("x") + "0", "zz" + sha("x").slice(2)]) {
    assert.equal(await verify({ id: 1, passwordHash }, "plain-password", save, 4), false, JSON.stringify(passwordHash));
  }
  assert.deepEqual(saved, []);
});
test("השוואה בזמן קבוע", () => {
  assert.match(code(import.meta.url, FILE), /timingSafeEqual/, "השוואת ה־SHA-256 עם timingSafeEqual");
});
