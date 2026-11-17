import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P07-E65.js";
const get = () => exportsOf(import.meta.url, FILE, ["moveCity","addTag"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

const make = () => ({ name: "דנה", address: { city: "חיפה", zip: "3100" }, tags: ["vip"] });
test("moveCity", async () => {
  const { moveCity } = await get();
  assert.deepEqual(moveCity(make(), "אילת"), { name: "דנה", address: { city: "אילת", zip: "3100" }, tags: ["vip"] });
});
test("moveCity לא משנה את המקור (גם לא את הכתובת)", async () => {
  const { moveCity } = await get();
  const user = make();
  const address = user.address;
  const r = moveCity(user, "אילת");
  assert.deepEqual(user, make(), "המשתמש המקורי השתנה");
  assert.equal(address.city, "חיפה", "הכתובת המקורית השתנתה — צריך להעתיק גם אותה");
  assert.notEqual(r.address, address);
});
test("addTag", async () => {
  const { addTag } = await get();
  const user = make();
  const tags = user.tags;
  const r = addTag(user, "new");
  assert.deepEqual(r.tags, ["vip", "new"]);
  assert.equal(r.name, "דנה");
  assert.deepEqual(tags, ["vip"], "המערך המקורי של התגיות השתנה");
  assert.deepEqual(user, make());
});
test("addTag — תגית קיימת", async () => {
  const { addTag } = await get();
  const user = make();
  assert.equal(addTag(user, "vip"), user);
});
