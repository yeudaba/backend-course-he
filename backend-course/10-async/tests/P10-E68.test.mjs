import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { exportsOf, code } from "./_src.mjs";
import { tmpFiles } from "./_cb.mjs";

const get = () => exportsOf(import.meta.url, "P10-E68.js", ["copyUpper"]);
const t = tmpFiles({ "a.txt": "hello", "b.txt": "Shalom World\nשלום" });

test("כותב באותיות גדולות ומחזיר את האורך — אחרי שהכתיבה הסתיימה", async () => {
  const { copyUpper } = await get();
  const n = await copyUpper(t.p("a.txt"), t.p("A.txt"));
  assert.equal(fs.existsSync(t.p("A.txt")) ? fs.readFileSync(t.p("A.txt"), "utf8") : "(הקובץ לא קיים)", "HELLO", "כשה־Promise מצליח הקובץ כבר צריך להיות כתוב — return לפני writeFile");
  assert.equal(n, 5);
  assert.equal(await copyUpper(t.p("b.txt"), t.p("B.txt")), 17);
  assert.equal(fs.readFileSync(t.p("B.txt"), "utf8"), "SHALOM WORLD\nשלום");
});
test("כישלונות עוברים הלאה", async () => {
  const { copyUpper } = await get();
  await assert.rejects(copyUpper(t.p("nope.txt"), t.p("x.txt")), (e) => e.code === "ENOENT");
  await assert.rejects(copyUpper(t.p("a.txt"), t.p("no-dir/x.txt")), (e) => e.code === "ENOENT", "שגיאת כתיבה צריכה להגיע למי שקרא — return לפני writeFile");
});
test("then בלבד", () => {
  const src = code(import.meta.url, "P10-E68.js");
  assert.ok(!/\bawait\b|\basync\b/.test(src), "בתרגיל הזה — שרשרת then, בלי async/await");
  assert.ok(!/writeFileSync\(dest|writeFileSync\(\s*dest/.test(src), "בלי writeFileSync — fs.writeFile מ־fs/promises");
});
