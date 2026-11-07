import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { doubles, labels, squares } = await load(import.meta.url, "P05-E22.js");

test("doubles", () => assert.equal(doubles, "2 4 6"));
test("labels", () => assert.equal(labels, "#1 #2 #3"));
test("squares", () => assert.equal(squares, "1 4 9"));
