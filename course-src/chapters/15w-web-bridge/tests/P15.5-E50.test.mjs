import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P15.5-E50.mjs", ["minifyCss"])).minifyCss;
test("בסיס", async () => {
  const f = await get();
  assert.equal(f(".card {\n  padding: 16px;\n  /* רקע */\n  background: white;\n}\n"), ".card{padding:16px;background:white}");
  assert.equal(f("a{color:red}"), "a{color:red}");
  assert.equal(f("   "), "");
});
test("רווחים שיש להם משמעות נשארים", async () => {
  const f = await get();
  assert.equal(f(".card   h2 {\tmargin : 8px   16px ; }"), ".card h2{margin:8px 16px}");
  assert.equal(f("button , .btn\n{ border : 1px solid  #ddd }"), "button,.btn{border:1px solid #ddd}");
  assert.equal(f("li.done .title { font-family: system-ui, sans-serif; }"), "li.done .title{font-family:system-ui,sans-serif}");
});
test("הערות", async () => {
  const f = await get();
  assert.equal(f("/* א */a{color:red}/* ב\nעל שתי שורות */b{color:blue}"), "a{color:red}b{color:blue}", "כמה הערות — כל אחת לבד");
  assert.equal(f("a{color:red;/* x */}"), "a{color:red}");
  assert.equal(f("a:hover{color:red;;}"), "a:hover{color:red;}", "רק ; אחד לפני } נמחק");
});
