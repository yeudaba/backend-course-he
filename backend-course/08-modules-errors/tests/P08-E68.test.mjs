import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P08-E68.js";
const get = () => exportsOf(import.meta.url, FILE, ["explainError"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

const caught = (fn) => {
  try {
    fn();
  } catch (err) {
    return err;
  }
  throw new Error("ציפינו לשגיאה");
};
test("Cannot read properties — שגיאות אמיתיות", async () => {
  const { explainError } = await get();
  assert.equal(explainError(caught(() => null.price)), 'ניסית לקרוא את "price" מתוך null — מה שמשמאל לנקודה ריק');
  const user = {};
  assert.equal(explainError(caught(() => user.address.city)), 'ניסית לקרוא את "city" מתוך undefined — מה שמשמאל לנקודה ריק');
});
test("is not a function", async () => {
  const { explainError } = await get();
  const sum = undefined;
  assert.equal(explainError(caught(() => sum([1]))), '"sum" הוא לא פונקציה — בדוק את השם ואת הייבוא');
  const obj = {};
  assert.equal(explainError(caught(() => obj.save())), '"obj.save" הוא לא פונקציה — בדוק את השם ואת הייבוא');
});
test("is not defined", async () => {
  const { explainError } = await get();
  // eslint-disable-next-line no-undef
  assert.equal(explainError(caught(() => totl + 1)), '"totl" לא מוגדר — שגיאת כתיב, או שחסר ייבוא?');
});
test("SyntaxError", async () => {
  const { explainError } = await get();
  const err = caught(() => JSON.parse("{bad"));
  assert.equal(explainError(err), `טקסט לא תקין: ${err.message}`);
});
test("כל השאר", async () => {
  const { explainError } = await get();
  assert.equal(explainError(new Error("ההזמנה לא נמצאה")), "Error: ההזמנה לא נמצאה");
  assert.equal(explainError(new RangeError("גדול מדי")), "RangeError: גדול מדי");
  const fake = new Error("x is not defined");
  assert.equal(explainError(fake), "Error: x is not defined", "הודעה של Error רגיל לא מתפרשת כ־ReferenceError");
  assert.equal(explainError(new TypeError("משהו אחר")), "TypeError: משהו אחר");
});
