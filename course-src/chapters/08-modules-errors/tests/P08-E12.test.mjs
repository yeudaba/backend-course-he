import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { isActive, countActive } = await load(import.meta.url, "P08-E12.js");

test("isActive", () => { assert.equal(isActive("1"), true); assert.equal(isActive("0"), false); assert.equal(isActive(""), false); assert.equal(isActive(" "), false); assert.equal(isActive("2"), false); assert.equal(isActive("abc"), false); });
test("countActive", () => assert.equal(countActive(["1", "0", "1", "", " ", "2"]), 2));
