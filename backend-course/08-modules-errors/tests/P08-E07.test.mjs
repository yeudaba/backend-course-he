import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { slugify, wordCount, default: summary } = await load(import.meta.url, "P08-E07.mjs");

test("slugify יוצא בשם", () => assert.equal(slugify("  Learn   Node JS "), "learn-node-js"));
test("wordCount יוצא בשם", () => { assert.equal(wordCount("  a  b c "), 3); assert.equal(wordCount(""), 0); });
test("summary הוא ייצוא ברירת המחדל", () => assert.equal(summary("Learn Node JS"), "3 מילים: learn-node-js"));
