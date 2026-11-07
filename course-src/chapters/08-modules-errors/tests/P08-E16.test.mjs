import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { orderTotal } = await load(import.meta.url, "P08-E16.js");

test("qty חסר = 1, qty 0 = 0", () => assert.equal(orderTotal([{ price: 10, qty: 2 }, { price: 5 }, { price: 3, qty: 0 }]), 25));
test("ריק", () => assert.equal(orderTotal([]), 0));
