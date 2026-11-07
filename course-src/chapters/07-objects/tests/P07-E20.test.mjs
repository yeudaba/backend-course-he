import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { toSummaries, findByName, outOfStock } = await load(import.meta.url, "P07-E20.js");

const make = () => [{ name: "עט", price: 5, stock: 0 }, { name: "דף", price: 1, stock: 9 }];
test("toSummaries", () => assert.deepEqual(toSummaries(make()), [{ name: "עט", price: 5 }, { name: "דף", price: 1 }]));
test("findByName", () => { assert.deepEqual(findByName(make(), "דף"), { name: "דף", price: 1, stock: 9 }); assert.equal(findByName(make(), "x"), null); });
test("outOfStock מחזיר רק את מה שאזל — ולא משנה מלאי", () => { const p = make(); assert.deepEqual(outOfStock(p).map((x) => x.name), ["עט"]); assert.equal(p[1].stock, 9); });
