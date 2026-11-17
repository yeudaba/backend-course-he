import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { exportsOf, code } from "./_src.mjs";
import { calls, tmpFiles } from "./_cb.mjs";

const get = () => exportsOf(import.meta.url, "P10-E58.js", ["readAll"]);
const t = tmpFiles({ "a.txt": "A", "b.txt": "BB", "c.txt": "CCC" });

// readFile עם עיכוב לכל קובץ — כדי שהסדר שבו מסיימים יהיה שונה מהסדר המקורי
function withDelays(delays, fn) {
  const orig = fs.readFile;
  let active = 0;
  let maxActive = 0;
  fs.readFile = (file, enc, cb) => {
    if (!String(file).startsWith(t.dir)) return orig(file, enc, cb); // רק הקבצים של הבדיקה
    active++;
    maxActive = Math.max(maxActive, active);
    const name = file.split("/").pop();
    setTimeout(() => orig(file, enc, (err, text) => { active--; cb(err, text); }), delays[name] ?? 0);
  };
  return fn().finally(() => (fs.readFile = orig)).then((r) => ({ r, maxActive }));
}

test("תוצאות לפי הסדר המקורי, גם כשהסיום בסדר אחר", async () => {
  const { readAll } = await get();
  const { r: c, maxActive } = await withDelays({ "a.txt": 40, "b.txt": 5, "c.txt": 20 }, () => calls((cb) => readAll([t.p("a.txt"), t.p("b.txt"), t.p("c.txt")], cb)));
  assert.equal(c.length, 1, `ה־callback נקרא ${c.length} פעמים`);
  assert.deepEqual(c[0].args, [null, ["A", "BB", "CCC"]], "texts[i] צריך להיות התוכן של files[i] — שמור לפי אינדקס, לא push");
  assert.equal(maxActive, 3, "הקריאות צריכות להתחיל יחד (במקביל), לא אחת אחרי השנייה");
});
test("שתי שגיאות ← callback פעם אחת, עם הראשונה שהגיעה", async () => {
  const { readAll } = await get();
  const { r: c } = await withDelays({ "x.txt": 30, "y.txt": 5, "a.txt": 10 }, () => calls((cb) => readAll([t.p("x.txt"), t.p("a.txt"), t.p("y.txt")], cb), { after: 80 }));
  assert.equal(c.length, 1, `ה־callback נקרא ${c.length} פעמים — אחרי השגיאה הראשונה אסור לקרוא לו שוב`);
  assert.equal(c[0].args[0]?.code, "ENOENT");
  assert.ok(c[0].args[0].path.endsWith("y.txt"), "צריך את השגיאה שהגיעה ראשונה (y.txt, אחרי 5ms)");
});
test("מערך ריק ← [] בטיימר", async () => {
  const { readAll } = await get();
  const c = await calls((cb) => readAll([], cb));
  assert.equal(c.length, 1);
  assert.deepEqual(c[0].args, [null, []]);
  assert.equal(c[0].sync, false, "גם עם מערך ריק ה־callback מגיע אחר כך");
});
test("בלי Promises", () => {
  assert.ok(!/Promise|await|fs\/promises/.test(code(import.meta.url, "P10-E58.js")), "המשימה: רק callbacks (בלי Promise ו־await)");
});
