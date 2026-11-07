import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { greet } = await load(import.meta.url, "P08-E20.js");

test("greet", () => assert.equal(greet("dana"), "HELLO DANA!"));
