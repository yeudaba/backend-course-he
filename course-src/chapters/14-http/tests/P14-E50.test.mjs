import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const mod = async () => exportsOf(import.meta.url, "P14-E50.mjs", ["parseContentType", "isJson"]);

test("parseContentType", async () => {
  const { parseContentType: f } = await mod();
  assert.deepEqual(f("application/json; charset=utf-8"), { type: "application/json", charset: "utf-8" });
  assert.deepEqual(f("Application/JSON"), { type: "application/json", charset: null });
  assert.deepEqual(f('text/html;Charset="UTF-8"'), { type: "text/html", charset: "utf-8" }, "שם הפרמטר בלי תלות באותיות, ובלי מירכאות");
  assert.deepEqual(f("multipart/form-data; boundary=a=b; charset=iso-8859-8"), { type: "multipart/form-data", charset: "iso-8859-8" }, "פרמטרים אחרים — מתעלמים");
  assert.deepEqual(f("  text/plain ;  charset = windows-1255 "), { type: "text/plain", charset: "windows-1255" });
  assert.deepEqual(f("text/plain; flag"), { type: "text/plain", charset: null }, "פרמטר בלי = לא מפיל");
});
test("parseContentType — ערך חסר", async () => {
  const { parseContentType: f } = await mod();
  assert.equal(f(undefined), null);
  assert.equal(f(""), null);
  assert.equal(f("   "), null);
});
test("isJson", async () => {
  const { isJson: f } = await mod();
  for (const v of ["application/json", "application/json; charset=utf-8", "APPLICATION/JSON", "application/problem+json", "application/vnd.api+json; charset=utf-8"]) {
    assert.equal(f(v), true, `${v} הוא JSON`);
  }
  for (const v of ["text/plain", "text/html; charset=utf-8", "application/jsonp", "text/not-application/json", undefined, ""]) {
    assert.equal(f(v), false, `${v} אינו JSON`);
  }
});
