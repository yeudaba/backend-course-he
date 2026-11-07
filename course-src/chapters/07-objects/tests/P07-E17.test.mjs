import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { diff } = await load(import.meta.url, "P07-E17.js");

test("שינויים, הוספות והסרות", () => assert.deepEqual(diff({ name: "עט", price: 5, color: "כחול" }, { name: "עט", price: 4, size: "M" }), [
  { key: "color", from: "כחול", to: undefined },
  { key: "price", from: 5, to: 4 },
  { key: "size", from: undefined, to: "M" },
]));
test("אין שינוי", () => assert.deepEqual(diff({ a: 1 }, { a: 1 }), []));
