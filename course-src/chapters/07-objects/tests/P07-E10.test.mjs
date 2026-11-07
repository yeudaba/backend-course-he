import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { sortByPrice, sortByName, cheapest } = await load(import.meta.url, "P07-E10.js");

const products = [{ name: "מסך", price: 899 }, { name: "עכבר", price: 89 }, { name: "כבל", price: 5 }];
test("sortByPrice", () => assert.deepEqual(sortByPrice(products).map((p) => p.price), [5, 89, 899]));
test("sortByName", () => assert.deepEqual(sortByName(products).map((p) => p.name), ["כבל", "מסך", "עכבר"]));
test("cheapest", () => { assert.equal(cheapest(products).name, "כבל"); assert.equal(cheapest([]), null); });
test("לא משנה את הקלט", () => { sortByPrice(products); sortByName(products); assert.deepEqual(products.map((p) => p.name), ["מסך", "עכבר", "כבל"]); });
