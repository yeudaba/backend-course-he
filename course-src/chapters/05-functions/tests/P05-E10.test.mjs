import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { formatPrice } = await load(import.meta.url, "P05-E10.js");

test("ברירות מחדל", () => assert.equal(formatPrice(19.9), "₪ 19.90"));
test("מטבע אחר", () => assert.equal(formatPrice(19.9, "$"), "$ 19.90"));
test("0 ספרות", () => assert.equal(formatPrice(5, "$", 0), "$ 5"));
test("עיגול", () => assert.equal(formatPrice(2.999), "₪ 3.00"));
