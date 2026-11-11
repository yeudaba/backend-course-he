import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";
import { typesOk } from "./_app.mjs";

const FILE = "P15-E62.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["sortBy"])).sortBy;
const tasks = () => [
  { id: 1, status: "open", priority: 2, title: "ב" },
  { id: 2, status: "done", priority: 5, title: "א" },
  { id: 3, status: "open", priority: 10, title: "ג" },
  { id: 4, status: "done", priority: 5, title: "ד" },
  { id: 5, status: "open", priority: 9, title: "א" },
];
const allowed = ["status", "priority", "id", "title"];
const ids = (list) => list.map((t) => t.id);

test("עובר בדיקת טיפוסים", () => typesOk(import.meta.url, FILE));
test("שדה אחד, עולה ויורד", async () => {
  const sortBy = await get();
  assert.deepEqual(ids(sortBy(tasks(), "priority", allowed)), [1, 2, 4, 5, 3], "מספרים כמספרים — 10 אחרי 9");
  assert.deepEqual(ids(sortBy(tasks(), "-priority", allowed)), [3, 5, 2, 4, 1], "שוויון (2,4) — הסדר המקורי");
  assert.deepEqual(ids(sortBy(tasks(), "title", allowed)), [2, 5, 1, 3, 4]);
});
test("כמה שדות", async () => {
  const sortBy = await get();
  assert.deepEqual(ids(sortBy(tasks(), "status,-priority", allowed)), [2, 4, 3, 5, 1]);
  assert.deepEqual(ids(sortBy(tasks(), "-status, title", allowed)), [5, 1, 3, 2, 4]);
  assert.deepEqual(ids(sortBy(tasks(), "title,-id", allowed)), [5, 2, 1, 3, 4]);
});
test("ריק, מקורי ושדות אסורים", async () => {
  const sortBy = await get();
  const input = tasks();
  const out = sortBy(input, "", allowed);
  assert.deepEqual(ids(out), [1, 2, 3, 4, 5]);
  assert.notEqual(out, input, "מחזיר מערך חדש");
  sortBy(input, "-id", allowed);
  assert.deepEqual(ids(input), [1, 2, 3, 4, 5], "המערך המקורי לא השתנה");
  assert.throws(() => sortBy(input, "status,password", allowed), { message: "אי אפשר למיין לפי password" });
  assert.throws(() => sortBy(input, "-secret", allowed), { message: "אי אפשר למיין לפי secret" });
});
