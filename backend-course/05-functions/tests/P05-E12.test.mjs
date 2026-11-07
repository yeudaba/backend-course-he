import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { applyTwice, applyN } = await load(import.meta.url, "P05-E12.js");

test("applyTwice על מספר", () => assert.equal(applyTwice((x) => x + 3, 10), 16));
test("applyTwice — מפעיל על התוצאה, לא פעמיים על אותו ערך", () => assert.equal(applyTwice((x) => x * 10, 2), 200));
test("applyN על מחרוזת", () => assert.equal(applyN((s) => s + "!", "היי", 3), "היי!!!"));
test("applyN עם 0 פעמים מחזיר את הערך", () => assert.equal(applyN((x) => x * 2, 7, 0), 7));
