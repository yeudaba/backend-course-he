import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { cleanTags } = await load(import.meta.url, "P06-E14.js");

test("דוגמה מהתרגיל", () => assert.deepEqual(cleanTags(" Node, , backend ,API, node ,  "), ["node", "backend", "api"]));
test("ריק", () => assert.deepEqual(cleanTags(" , ,"), []));
test("לכל היותר 5", () => assert.deepEqual(cleanTags("a,b,c,d,e,f,g"), ["a", "b", "c", "d", "e"]));
test("max אחר", () => assert.deepEqual(cleanTags("a,b,c", 2), ["a", "b"]));
