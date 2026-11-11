import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = async () => (await exportsOf(import.meta.url, "P15.5-E13.mjs", ["renderTable"])).renderTable;
const columns = [
  { key: "name", label: "מוצר" },
  { key: "price", label: "מחיר", numeric: true },
];

test("טבלה פשוטה", async () => {
  const renderTable = await get();
  assert.equal(
    renderTable(columns, [{ name: "עט", price: 4.5 }, { name: "כוס", price: 19.9 }]),
    '<table><thead><tr><th>מוצר</th><th>מחיר</th></tr></thead><tbody><tr><td>עט</td><td class="num">4.5</td></tr><tr><td>כוס</td><td class="num">19.9</td></tr></tbody></table>',
  );
});
test("ערכים חסרים ← —, אבל 0 נשאר 0", async () => {
  const renderTable = await get();
  const html = renderTable(columns, [{ name: "עט" }, { name: null, price: 0 }]);
  assert.equal(html, '<table><thead><tr><th>מוצר</th><th>מחיר</th></tr></thead><tbody><tr><td>עט</td><td class="num">—</td></tr><tr><td>—</td><td class="num">0</td></tr></tbody></table>', "null/undefined ← —, ו־0 הוא ערך אמיתי");
});
test("הסדר לפי columns, ושדות אחרים לא מוצגים", async () => {
  const renderTable = await get();
  const html = renderTable([{ key: "email", label: "אימייל" }, { key: "id", label: "#", numeric: true }], [{ id: 7, passwordHash: "secret", email: "a@b.co" }]);
  assert.equal(html, '<table><thead><tr><th>אימייל</th><th>#</th></tr></thead><tbody><tr><td>a@b.co</td><td class="num">7</td></tr></tbody></table>');
  assert.ok(!html.includes("secret"), "רק העמודות שב־columns מוצגות");
});
test("הכול מקודד — גם הכותרות", async () => {
  const renderTable = await get();
  const html = renderTable([{ key: "t", label: "<b>כותרת</b> & \"עוד\"" }], [{ t: `<img src=x onerror='alert(1)'>` }]);
  assert.equal(html, "<table><thead><tr><th>&lt;b&gt;כותרת&lt;/b&gt; &amp; &quot;עוד&quot;</th></tr></thead><tbody><tr><td>&lt;img src=x onerror=&#39;alert(1)&#39;&gt;</td></tr></tbody></table>");
});
test("אין שורות", async () => {
  const renderTable = await get();
  assert.equal(renderTable(columns, []), '<p class="empty">אין נתונים להצגה</p>');
});
