import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";
import { calls, tmpFiles } from "./_cb.mjs";

const get = () => exportsOf(import.meta.url, "P10-E51.js", ["readLines"]);
const t = tmpFiles({ "a.txt": "קפה\nחלב\nלחם\n", "b.txt": "בלי ירידת שורה\nבסוף", "empty.txt": "", "mid.txt": "א\n\nב\n" });

test("שורות, בלי השורה הריקה שבסוף", async () => {
  const { readLines } = await get();
  const c = await calls((cb) => readLines(t.p("a.txt"), cb));
  assert.equal(c.length, 1, `ה־callback נקרא ${c.length} פעמים`);
  assert.deepEqual(c[0].args, [null, ["קפה", "חלב", "לחם"]]);
  assert.deepEqual((await calls((cb) => readLines(t.p("b.txt"), cb)))[0].args, [null, ["בלי ירידת שורה", "בסוף"]]);
});
test("שורה ריקה באמצע נשארת; קובץ ריק ← []", async () => {
  const { readLines } = await get();
  assert.deepEqual((await calls((cb) => readLines(t.p("mid.txt"), cb)))[0].args, [null, ["א", "", "ב"]]);
  assert.deepEqual((await calls((cb) => readLines(t.p("empty.txt"), cb)))[0].args, [null, []]);
});
test("קובץ שלא קיים ← השגיאה המקורית, פעם אחת", async () => {
  const { readLines } = await get();
  const c = await calls((cb) => readLines(t.p("nope.txt"), cb));
  assert.equal(c.length, 1, `ה־callback נקרא ${c.length} פעמים — שכחת return אחרי callback(err)?`);
  assert.equal(c[0].args[0]?.code, "ENOENT", "הארגומנט הראשון צריך להיות השגיאה של fs.readFile");
});
test("בלי readFileSync", () => {
  assert.ok(!/readFileSync/.test(code(import.meta.url, "P10-E51.js")), "המשימה היא לתרגל fs.readFile עם callback");
});
