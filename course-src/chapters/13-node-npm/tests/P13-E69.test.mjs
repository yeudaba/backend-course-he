import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P13-E69.mjs", ["expand"])).expand;

test("הדוגמה מהמשימה, בלי לשנות את המקור", async () => {
  const expand = await get();
  const vars = { DB_USER: "dana", DB_HOST: "localhost", DATABASE_URL: "postgres://${DB_USER}@${DB_HOST}/shop" };
  const copy = { ...vars };
  assert.deepEqual(expand(vars), { DB_USER: "dana", DB_HOST: "localhost", DATABASE_URL: "postgres://dana@localhost/shop" });
  assert.deepEqual(vars, copy, "המקור השתנה");
});
test("הפניה בתוך הפניה, ו־$ בלי סוגריים", async () => {
  const expand = await get();
  assert.deepEqual(expand({ URL: "${BASE}/api", BASE: "${PROTO}://${HOST}", PROTO: "https", HOST: "x.com", P: "$5 $HOST ${HOST}" }), {
    URL: "https://x.com/api",
    BASE: "https://x.com",
    PROTO: "https",
    HOST: "x.com",
    P: "$5 $HOST x.com",
  });
  assert.deepEqual(expand({}), {});
});
test("משתנה לא מוגדר", async () => {
  const expand = await get();
  assert.throws(() => expand({ A: "x", URL: "${A}/${MISSING}" }), { message: "משתנה לא מוגדר: MISSING (ב־URL)" });
});
test("הפניה מעגלית", async () => {
  const expand = await get();
  assert.throws(() => expand({ A: "${B}", B: "${A}" }), { message: "הפניה מעגלית: A" });
  assert.throws(() => expand({ X: "1", SELF: "a${SELF}" }), { message: "הפניה מעגלית: SELF" });
});
