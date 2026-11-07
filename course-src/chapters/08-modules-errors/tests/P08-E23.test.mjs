import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { roundPrice, priceWithVat, isFree } = await load(import.meta.url, "P08-E23.js");

test("priceWithVat", () => { assert.equal(priceWithVat(100), 118); assert.equal(priceWithVat(10, 0.17), 11.7); });
test("isFree", () => { assert.equal(isFree("0"), true); assert.equal(isFree(0), true); assert.equal(isFree(""), false); assert.equal(isFree(" "), false); assert.equal(isFree(5), false); });
