import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P15.5-E30.mjs", ["renderOptions"])).renderOptions;
const cats = [{ value: 1, label: "ספרים" }, { value: 2, label: "R&D <כלים>" }, { value: "x\"y", label: "O'Brien" }];
test("בסיס ו־selected", async () => {
  const f = await get();
  assert.equal(f(cats.slice(0, 1), "1"), '<option value="1" selected>ספרים</option>');
  assert.equal(f(cats, "2"), '<option value="1">ספרים</option><option value="2" selected>R&amp;D &lt;כלים&gt;</option><option value="x&quot;y">O&#39;Brien</option>');
  assert.equal(f(cats, 1), '<option value="1" selected>ספרים</option><option value="2">R&amp;D &lt;כלים&gt;</option><option value="x&quot;y">O&#39;Brien</option>');
  assert.equal(f(cats, 'x"y').includes('<option value="x&quot;y" selected>'), true);
  assert.equal(f([], "1"), "");
  assert.equal(f(cats.slice(0, 2)).includes("selected"), false, "בלי selected — אף אחת");
});
test("placeholder", async () => {
  const f = await get();
  const two = cats.slice(0, 2);
  assert.equal(f(two, undefined, "בחר"), '<option value="" selected>בחר</option><option value="1">ספרים</option><option value="2">R&amp;D &lt;כלים&gt;</option>');
  assert.equal(f(two, "2", "בחר"), '<option value="">בחר</option><option value="1">ספרים</option><option value="2" selected>R&amp;D &lt;כלים&gt;</option>');
  assert.equal(f(two, "9", "<בחר>"), '<option value="" selected>&lt;בחר&gt;</option><option value="1">ספרים</option><option value="2">R&amp;D &lt;כלים&gt;</option>');
});
