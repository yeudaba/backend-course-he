import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P16-E48.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["describe"])).describe;
test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("טיפוסים ו־nullable", async () => {
  const f = await get();
  assert.deepEqual(
    f([
      { id: 1, name: "Pen", price: 4.5, active: true, added_on: "2026-01-10", note: null },
      { id: 2, name: "Cup", price: 19, active: false, added_on: "2026-02-01", note: null, color: "red" },
      { id: 3, name: 42, price: 7, active: null, added_on: "soon", note: null },
    ]),
    [
      { column: "id", type: "integer", nullable: false },
      { column: "name", type: "mixed", nullable: false },
      { column: "price", type: "numeric", nullable: false },
      { column: "active", type: "boolean", nullable: true },
      { column: "added_on", type: "text", nullable: false },
      { column: "note", type: "unknown", nullable: true },
      { column: "color", type: "text", nullable: true },
    ],
  );
  assert.deepEqual(f([{ d: "2026-01-01" }, { d: "2026-12-31" }, {}]), [{ column: "d", type: "date", nullable: true }]);
  assert.deepEqual(f([{ x: 1 }, { x: "1" }]), [{ column: "x", type: "mixed", nullable: false }]);
  assert.deepEqual(f([]), []);
});
