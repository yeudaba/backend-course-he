import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { findById, namesOf, inStock, totalStock } = await load(import.meta.url, "P07-E09.js");

const items = [{ id: 1, name: "עט", stock: 3 }, { id: 2, name: "דף", stock: 0 }, { id: 3, name: "תיק", stock: 1 }];
test("findById", () => { assert.deepEqual(findById(items, 2), { id: 2, name: "דף", stock: 0 }); assert.equal(findById(items, 9), null); });
test("namesOf", () => assert.deepEqual(namesOf(items), ["עט", "דף", "תיק"]));
test("inStock", () => assert.deepEqual(inStock(items).map((i) => i.id), [1, 3]));
test("totalStock", () => { assert.equal(totalStock(items), 4); assert.equal(totalStock([]), 0); });
