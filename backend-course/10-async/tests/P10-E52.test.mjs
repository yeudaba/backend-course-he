import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { exportsOf } from "./_src.mjs";
import { calls, tmpFiles } from "./_cb.mjs";

const get = () => exportsOf(import.meta.url, "P10-E52.js", ["joinFiles"]);
const t = tmpFiles({ "h.txt": "כותרת\n", "b.txt": "גוף\n", "x.txt": "X" });

test("מחבר את שני הקבצים לפי הסדר", async () => {
  const { joinFiles } = await get();
  const c = await calls((cb) => joinFiles(t.p("h.txt"), t.p("b.txt"), cb));
  assert.equal(c.length, 1);
  assert.deepEqual(c[0].args, [null, "כותרת\nגוף\n"]);
  assert.deepEqual((await calls((cb) => joinFiles(t.p("x.txt"), t.p("h.txt"), cb)))[0].args, [null, "Xכותרת\n"]);
});
test("הקריאה השנייה מתחילה רק אחרי שהראשונה הצליחה", async () => {
  const { joinFiles } = await get();
  const orig = fs.readFile;
  const order = [];
  fs.readFile = (file, enc, cb) => {
    if (!String(file).startsWith(t.dir)) return orig(file, enc, cb);
    order.push(`start ${file.endsWith("h.txt") ? "A" : "B"}`);
    orig(file, enc, (err, text) => {
      order.push(`end ${file.endsWith("h.txt") ? "A" : "B"}`);
      cb(err, text);
    });
  };
  try {
    await calls((cb) => joinFiles(t.p("h.txt"), t.p("b.txt"), cb));
  } finally {
    fs.readFile = orig;
  }
  assert.deepEqual(order, ["start A", "end A", "start B", "end B"], "קרא את fileB רק בתוך ה־callback של fileA (ודרך fs.readFile)");
});
test("הראשון חסר ← השגיאה, ולא קוראים את השני", async () => {
  const { joinFiles } = await get();
  const orig = fs.readFile;
  let reads = 0;
  fs.readFile = (...a) => { if (String(a[0]).startsWith(t.dir)) reads++; return orig(...a); };
  let c;
  try {
    c = await calls((cb) => joinFiles(t.p("nope.txt"), t.p("b.txt"), cb));
  } finally {
    fs.readFile = orig;
  }
  assert.equal(c.length, 1, `ה־callback נקרא ${c.length} פעמים`);
  assert.equal(c[0].args[0]?.code, "ENOENT");
  assert.equal(reads, 1, "אחרי שהקריאה הראשונה נכשלה אין טעם לקרוא את השני");
});
test("השני חסר ← השגיאה, פעם אחת", async () => {
  const { joinFiles } = await get();
  const c = await calls((cb) => joinFiles(t.p("h.txt"), t.p("nope.txt"), cb));
  assert.equal(c.length, 1);
  assert.equal(c[0].args[0]?.code, "ENOENT");
});
