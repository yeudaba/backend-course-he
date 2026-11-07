import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { countChar, countMatching, countVowels } = await load(import.meta.url, "P05-E16.js");

test("countChar", () => { assert.equal(countChar("banana", "a"), 3); assert.equal(countChar("Banana", "b"), 0); assert.equal(countChar("", "a"), 0); });
test("countMatching עם predicate", () => assert.equal(countMatching("a1b22c", (ch) => "0123456789".includes(ch)), 3));
test("countVowels בלי תלות באותיות", () => { assert.equal(countVowels("Backend Developers Love Coffee"), 11); assert.equal(countVowels("AEIOU xyz"), 5); });
