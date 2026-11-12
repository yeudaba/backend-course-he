import { test } from "node:test";
import assert from "node:assert/strict";
import { scryptSync } from "node:crypto";
import { load } from "../../tools/load.mjs";

const { hashPassword, verifyPassword } = await load(import.meta.url, "P27-E89.ts");

test("פורמט, salt שונה, ואימות", () => {
  const a = hashPassword("correct horse");
  const b = hashPassword("correct horse");
  assert.match(a, /^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$/);
  assert.notEqual(a, b, "salt אקראי");
  const [, salt, hash] = a.split("$");
  assert.equal(scryptSync("correct horse", Buffer.from(salt, "hex"), 64).toString("hex"), hash, "scryptSync(password, salt, 64)");
  assert.equal(verifyPassword("correct horse", a), true);
  assert.equal(verifyPassword("correct horse", b), true);
  assert.equal(verifyPassword("Correct horse", a), false);
  assert.equal(verifyPassword("", hashPassword("")), true);
});
test("פורמט לא תקין ← false", () => {
  const good = hashPassword("x");
  const [, salt, hash] = good.split("$");
  for (const bad of ["", "scrypt", `bcrypt$${salt}$${hash}`, `scrypt$${salt}`, `scrypt$zz$${hash}`, `scrypt$${salt}$${hash.slice(2)}`, `scrypt$${salt}$${hash}$extra`.replace(/\$extra$/, "") + "0"]) {
    assert.equal(verifyPassword("x", bad), false, bad.slice(0, 30));
  }
});
