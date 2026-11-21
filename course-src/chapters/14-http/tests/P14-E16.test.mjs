import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { createRouter } = await load(import.meta.url, "P14-E16.mjs");

// router עם ה־routes מהמשימה. כל handler הוא פונקציה שמחזירה את השם שלה — כך ההודעה אומרת איזה נבחר
function shop() {
  const r = createRouter();
  const h = Object.fromEntries(["list", "create", "newForm", "one", "del", "reviews"].map((n) => [n, () => n]));
  r.add("GET", "/products", h.list);
  r.add("POST", "/products", h.create);
  r.add("GET", "/products/new", h.newForm);
  r.add("GET", "/products/:id", h.one);
  r.add("DELETE", "/products/:id", h.del);
  r.add("GET", "/products/:id/reviews/:rid", h.reviews);
  return { r, h };
}
const name = (m) => (typeof m?.handler === "function" ? m.handler() : m?.handler);

test("התאמה בלי פרמטרים", () => {
  const { r, h } = shop();
  assert.deepEqual(r.match("GET", "/products"), { status: 200, handler: h.list, params: {} }, 'match("GET", "/products")');
  assert.deepEqual(r.match("POST", "/products"), { status: 200, handler: h.create, params: {} }, 'match("POST", "/products")');
});
test("פרמטרים ופענוח", () => {
  const { r, h } = shop();
  assert.deepEqual(r.match("GET", "/products/7"), { status: 200, handler: h.one, params: { id: "7" } }, 'match("GET", "/products/7")');
  assert.deepEqual(r.match("DELETE", "/products/%D7%90"), { status: 200, handler: h.del, params: { id: "א" } }, 'match("DELETE", "/products/%D7%90") — params אחרי decodeURIComponent');
  assert.deepEqual(r.match("GET", "/products/7/reviews/3"), { status: 200, handler: h.reviews, params: { id: "7", rid: "3" } }, 'match("GET", "/products/7/reviews/3") — שני פרמטרים');
});
test("סלאשים כפולים או בסוף לא משנים", () => {
  const { r, h } = shop();
  assert.equal(name(r.match("GET", "/products/")), "list", 'match("GET", "/products/")');
  assert.deepEqual(r.match("GET", "//products/7/reviews/3"), { status: 200, handler: h.reviews, params: { id: "7", rid: "3" } }, 'match("GET", "//products/7/reviews/3")');
  const r2 = createRouter();
  const users = () => "users";
  r2.add("GET", "/users/", users);
  assert.equal(r2.match("GET", "/users")?.handler, users, 'add("GET", "/users/") ואז match("GET", "/users") — גם ב־pattern סלאש בסוף לא משנה');
});
test("הסדר קובע: route שנוסף קודם מנצח", () => {
  const { r } = shop();
  assert.equal(name(r.match("GET", "/products/new")), "newForm", 'match("GET", "/products/new") — ‏/products/new נוסף לפני /products/:id');
  const r2 = createRouter();
  const byId = () => "byId";
  const fixed = () => "fixed";
  r2.add("GET", "/orders/:id", byId);
  r2.add("GET", "/orders/latest", fixed);
  assert.equal(r2.match("GET", "/orders/latest")?.handler, byId, "כש־/orders/:id נוסף קודם — הוא מנצח גם על /orders/latest");
});
test("405 עם allow, ו־404", () => {
  const { r } = shop();
  assert.deepEqual(r.match("PUT", "/products/7"), { status: 405, allow: ["GET", "DELETE"] }, 'match("PUT", "/products/7") — ה־path קיים, ה־method לא');
  assert.deepEqual(r.match("DELETE", "/products"), { status: 405, allow: ["GET", "POST"] }, 'match("DELETE", "/products")');
  assert.deepEqual(r.match("GET", "/products/7/x"), { status: 404 }, 'match("GET", "/products/7/x")');
  assert.deepEqual(r.match("GET", "/"), { status: 404 }, 'match("GET", "/")');
  assert.deepEqual(r.match("GET", "/products/7/reviews"), { status: 404 }, 'match("GET", "/products/7/reviews") — חסר חלק');
});
test("כל router עם routes משלו", () => {
  const a = createRouter();
  const b = createRouter();
  const ha = () => "a";
  a.add("GET", "/x", ha);
  assert.deepEqual(b.match("GET", "/x"), { status: 404 }, "route שנוסף ל־router אחד לא אמור להופיע ב־router אחר");
  assert.equal(a.match("GET", "/x")?.handler, ha);
});
