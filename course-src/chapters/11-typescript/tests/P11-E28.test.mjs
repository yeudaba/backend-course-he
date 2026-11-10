import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe } from "./_ts.mjs";

const FILE = "P11-E28.ts";
const get = () => exportsOf(import.meta.url, FILE, ["findUsers"]);
const DB = new Map([
  [1, { id: 1, name: "דנה" }],
  [3, { id: 3, name: "עומר" }],
  [5, { id: 5, name: "נועה" }],
]);
function fakeGetUser(ms = 0) {
  const calls = [];
  const getUser = (id) => {
    calls.push(id);
    return new Promise((r) => setTimeout(() => r(DB.get(id)), ms));
  };
  return { getUser, calls };
}

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("הטיפוסים של findUsers", () => {
  const r = typeProbe(
    import.meta.url,
    FILE,
    `import { findUsers, type User } from "FILE";

const getUser = async (id: number): Promise<User | undefined> => (id === 1 ? { id, name: "a" } : undefined);
async function main() {
  const r = await findUsers([1, 2], getUser);
  // found הוא מערך של User, ו־missing מערך של מספרים
  const users: User[] = r.found;
  const ids: number[] = r.missing;
  // @ts-expect-error — getUser חייבת להחזיר Promise
  await findUsers([1], (id: number) => ({ id, name: "a" }));
  // @ts-expect-error — ids הם מספרים
  await findUsers(["1"], getUser);
  return { users, ids };
}

export { main };
`
  );
  assert.ok(r.ok, r.message);
});
test("הדוגמה מהמשימה", async () => {
  const { findUsers } = await get();
  const { getUser } = fakeGetUser();
  assert.deepEqual(await findUsers([3, 2, 1, 3], getUser), {
    found: [{ id: 3, name: "עומר" }, { id: 1, name: "דנה" }],
    missing: [2],
  });
});
test("id כפול נשלף פעם אחת", async () => {
  const { findUsers } = await get();
  const { getUser, calls } = fakeGetUser();
  const r = await findUsers([5, 5, 9, 5, 9], getUser);
  assert.deepEqual(calls.sort(), [5, 9], "getUser נקראה יותר מפעם אחת לאותו id (new Set?)");
  assert.deepEqual(r, { found: [{ id: 5, name: "נועה" }], missing: [9] });
});
test("רשימה ריקה", async () => {
  const { findUsers } = await get();
  assert.deepEqual(await findUsers([], fakeGetUser().getUser), { found: [], missing: [] });
});
test("במקביל: 4 משתמשים × 50ms ← פחות מ־150ms", async () => {
  const { findUsers } = await get();
  const { getUser } = fakeGetUser(50);
  const start = Date.now();
  await findUsers([1, 2, 3, 5], getUser);
  const ms = Date.now() - start;
  assert.ok(ms < 150, `לקח ${ms}ms — נראה שהמשתמשים נשלפים אחד אחרי השני. Promise.all`);
});
