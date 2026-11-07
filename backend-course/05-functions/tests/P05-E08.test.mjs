import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { totalWithVat } = await load(import.meta.url, "P05-E08.js");

test("דוגמה מהתרגיל", () => assert.equal(totalWithVat(49.9, 3, 0.18), 176.65));
test("בלי מע״מ", () => assert.equal(totalWithVat(10, 2, 0), 20));
test("מעוגל ל־2 ספרות", () => assert.equal(totalWithVat(0.1, 3, 0.17), 0.35));
test("מחזירה מספר, לא מחרוזת", () => assert.equal(typeof totalWithVat(1, 1, 0.18), "number"));
