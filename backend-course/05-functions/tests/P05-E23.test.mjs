import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { ageGroup } = await load(import.meta.url, "P05-E23.js");

test("ריק ורווחים", () => { assert.equal(ageGroup(""), "שגיאה: חובה להזין גיל"); assert.equal(ageGroup("   "), "שגיאה: חובה להזין גיל"); });
test("לא מספר", () => assert.equal(ageGroup("abc"), "שגיאה: גיל חייב להיות מספר"));
test("מחוץ לטווח", () => { assert.equal(ageGroup("-5"), "שגיאה: גיל לא הגיוני"); assert.equal(ageGroup("200"), "שגיאה: גיל לא הגיוני"); });
test("גיל 0 חוקי (תינוק)", () => assert.equal(ageGroup("0"), "קבוצה: קטין"));
test("קבוצות", () => { assert.equal(ageGroup("10"), "קבוצה: קטין"); assert.equal(ageGroup("30"), "קבוצה: מבוגר"); assert.equal(ageGroup("70"), "קבוצה: גמלאי"); });
test("minAge", () => assert.equal(ageGroup("5", 6), "שגיאה: גיל לא הגיוני"));
