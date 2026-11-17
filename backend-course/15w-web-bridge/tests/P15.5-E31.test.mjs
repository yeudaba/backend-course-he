import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P15.5-E31.mjs", ["checkForm"])).checkForm;
test("טופס תקין ← []", async () => {
  const f = await get();
  assert.deepEqual(f(`<form><label for="a">א</label><input id="a" name="a"><LABEL FOR=b>ב</LABEL><Select ID=b NAME=b></Select><label for='c'>ג</label><textarea id='c' name='c'></textarea><input type="submit"><input type=hidden name=t><button>x</button></form>`), []);
});
test("כל סוגי הבעיות, בסדר הנכון", async () => {
  const f = await get();
  const html = `<form>
  <label for="email">אימייל</label><input id="mail" name="email" type="email">
  <label for='phone'>טלפון</label><input id=phone type="tel">
  <input type="hidden" name="csrf"><button type="submit">שלח</button>
  <input type="checkbox">
  <p id="note"></p><span id="note"></span><b id="note"></b>
  <label for="ghost">?</label>
</form>`;
  assert.deepEqual(f(html), [
    "id כפול: note",
    "שדה בלי label: email",
    "שדה בלי name: phone",
    "שדה בלי name: ?",
    "שדה בלי label: ?",
    "label יתום: email",
    "label יתום: ghost",
  ]);
});
test("label שמצביע על id שאינו שדה — לא יתום", async () => {
  const f = await get();
  assert.deepEqual(f(`<label for="x">x</label><div id="x"></div><input id="y" name="y"><label for="y">y</label>`), []);
});
