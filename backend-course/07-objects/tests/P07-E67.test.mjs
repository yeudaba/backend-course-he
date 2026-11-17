import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P07-E67.js";
const get = () => exportsOf(import.meta.url, FILE, ["toCamel","camelizeKeys","camelizeRows"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("toCamel", async () => {
  const { toCamel } = await get();
  assert.equal(toCamel("first_name"), "firstName");
  assert.equal(toCamel("created_at_utc"), "createdAtUtc");
  assert.equal(toCamel("id"), "id");
  assert.equal(toCamel("user_id"), "userId");
});
test("camelizeKeys", async () => {
  const { camelizeKeys } = await get();
  assert.deepEqual(camelizeKeys({ id: 7, first_name: "דנה", last_login_at: null }), { id: 7, firstName: "דנה", lastLoginAt: null });
  assert.deepEqual(camelizeKeys({}), {});
});
test("camelizeKeys — אובייקט חדש, רק רמה ראשונה", async () => {
  const { camelizeKeys } = await get();
  const row = { home_address: { zip_code: "1" } };
  const r = camelizeKeys(row);
  assert.deepEqual(r, { homeAddress: { zip_code: "1" } });
  assert.deepEqual(Object.keys(row), ["home_address"], "המקור לא משתנה");
});
test("camelizeRows", async () => {
  const { camelizeRows } = await get();
  assert.deepEqual(camelizeRows([{ a_b: 1 }, { c_d: 2 }]), [{ aB: 1 }, { cD: 2 }]);
  assert.deepEqual(camelizeRows([]), []);
});
