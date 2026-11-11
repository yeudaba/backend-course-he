import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P16-E41.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["checkRows"])).checkRows;
test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("כל סוגי ההפרות, לפי הסדר", async () => {
  const f = await get();
  const rows = [
    { email: "dana@example.com", name: "Dana", price: 10 },
    { email: "dana@example.com", name: null, price: -5 },
    { email: null, name: "Avi", price: 3 },
    { email: null, name: "Gal", price: 0 },
    { email: "dana@example.com", price: 1 },
  ];
  assert.deepEqual(
    f(rows, { notNull: ["name", "email"], unique: ["email", "name"], check: { positive_price: (r) => r.price > 0, short_name: (r) => (r.name ?? "").length < 4 } }),
    [
      "row 0: check short_name failed",
      "row 1: name is null",
      "row 1: duplicate email: dana@example.com",
      "row 1: check positive_price failed",
      "row 2: email is null",
      "row 3: email is null",
      "row 3: check positive_price failed",
      "row 4: name is null",
      "row 4: duplicate email: dana@example.com",
    ],
  );
});
test("חלקים אופציונליים", async () => {
  const f = await get();
  assert.deepEqual(f([{ a: 1 }, { a: 1 }], {}), []);
  assert.deepEqual(f([{ a: 1 }, { a: 1 }, { a: "1" }], { unique: ["a"] }), ["row 1: duplicate a: 1"], "1 ו־\"1\" שונים");
  assert.deepEqual(f([], { notNull: ["x"] }), []);
});
