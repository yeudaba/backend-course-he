import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { parseAge, ageOrNull, strictAge } = await load(import.meta.url, "P08-E21.js");

test("parseAge זורקת על קלט רע", () => { assert.equal(parseAge("30"), 30); assert.throws(() => parseAge("abc"), { message: "גיל לא תקין: abc" }); });
test("ageOrNull", () => { assert.equal(ageOrNull("abc"), null); assert.equal(ageOrNull("0"), 0); });
test("strictAge זורקת על קלט רע ומחזירה מספר על תקין", () => { assert.equal(strictAge("30"), 30); assert.throws(() => strictAge("-1")); });
