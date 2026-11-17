import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P14-E37.mjs", ["decideStatus"])).decideStatus;
const ok = { loggedIn: true, allowed: true, exists: true, valid: true, duplicate: false };

test("הצלחה לפי method", async () => {
  const f = await get();
  assert.equal(f({ ...ok, method: "GET" }), 200);
  assert.equal(f({ ...ok, method: "PUT" }), 200);
  assert.equal(f({ ...ok, method: "PATCH" }), 200);
  assert.equal(f({ ...ok, method: "POST", exists: false }), 201, "POST שהצליח ← 201, גם כשהמשאב עוד לא קיים");
  assert.equal(f({ ...ok, method: "DELETE" }), 204);
});
test("כל שגיאה לבד", async () => {
  const f = await get();
  assert.equal(f({ ...ok, method: "GET", loggedIn: false }), 401);
  assert.equal(f({ ...ok, method: "GET", allowed: false }), 403);
  assert.equal(f({ ...ok, method: "GET", exists: false }), 404);
  assert.equal(f({ ...ok, method: "PUT", valid: false }), 400);
  assert.equal(f({ ...ok, method: "POST", duplicate: true }), 409);
});
test("הסדר בין הבדיקות", async () => {
  const f = await get();
  const bad = { loggedIn: false, allowed: false, exists: false, valid: false, duplicate: true };
  assert.equal(f({ ...bad, method: "GET" }), 401, "לא מחובר ← 401 לפני כל דבר אחר");
  assert.equal(f({ ...bad, loggedIn: true, method: "GET" }), 403, "403 לפני 404");
  assert.equal(f({ ...bad, loggedIn: true, allowed: true, method: "PATCH" }), 404, "404 לפני 400");
  assert.equal(f({ ...bad, loggedIn: true, allowed: true, method: "POST" }), 400, "ב־POST לא בודקים exists; 400 לפני 409");
  assert.equal(f({ ...bad, loggedIn: true, allowed: true, valid: true, method: "POST" }), 409);
  assert.equal(f({ ...ok, method: "DELETE", exists: false, valid: false }), 404);
});
