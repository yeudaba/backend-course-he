import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { toSlug, titleCase, wordCount } = await load(import.meta.url, "P06-E16.js");

test("toSlug", () => { assert.equal(toSlug("  Learn   Node JS  "), "learn-node-js"); assert.equal(toSlug("API"), "api"); });
test("titleCase", () => assert.equal(titleCase("  learn   NODE js "), "Learn Node Js"));
test("wordCount", () => { assert.equal(wordCount("  a  b c "), 3); assert.equal(wordCount(""), 0); assert.equal(wordCount("   "), 0); });
