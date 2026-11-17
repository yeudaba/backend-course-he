import { test } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P21-E38.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["parseBcrypt"])).parseBcrypt;

test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("הדוגמה מ־E29, ו־hash אמיתי", async () => {
  const parse = await get();
  assert.deepEqual(parse("$2b$11$C6UzMDM.H6dfI/f/IKxGhuWQOhIa6J4Nj.BEt9uzBOJpm4m1Nd6bW"), { version: "2b", cost: 11, salt: "C6UzMDM.H6dfI/f/IKxGhu", hash: "WQOhIa6J4Nj.BEt9uzBOJpm4m1Nd6bW" });
  const real = await bcrypt.hash("x", 5);
  const p = parse(real);
  assert.equal(p?.cost, 5);
  assert.equal(p.salt + p.hash, real.slice(7));
  assert.equal(parse("$2y$04$" + "a".repeat(53))?.version, "2y");
  assert.equal(parse("$2a$31$" + "/".repeat(53))?.cost, 31);
});
test("לא תקין ← null", async () => {
  const parse = await get();
  const body = "C6UzMDM.H6dfI/f/IKxGhuWQOhIa6J4Nj.BEt9uzBOJpm4m1Nd6bW";
  for (const bad of ["", "hunter2", `$2c$11$${body}`, `$2b$1$${body}`, `$2b$03$${body}`, `$2b$32$${body}`, `$2b$11$${body}x`, `$2b$11$${body.slice(1)}`, `x$2b$11$${body}`, `$2b$11$${body.replace("H", "!")}`, "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8"]) {
    assert.equal(parse(bad), null, `parseBcrypt(${JSON.stringify(bad)})`);
  }
});
